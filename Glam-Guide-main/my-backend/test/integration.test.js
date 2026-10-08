import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import User from '../src/models/User.js';
import WardrobeItem from '../src/models/WardrobeItem.js';

describe('End-to-End API Integration & User Isolation Tests', () => {
    const testSecret = 'integration_test_jwt_secret_key_123';
    process.env.JWT_SECRET = testSecret;

    // In-memory data store for integration tests
    const usersStore = [];
    const wardrobeStore = [];

    let originalUserFindOne;
    let originalUserFindById;
    let originalUserSave;
    let originalWardrobeFind;
    let originalWardrobeSave;
    let originalWardrobeFindOneAndDelete;
    let originalWardrobeFindOneAndUpdate;

    before(() => {
        // Stub User methods
        originalUserFindOne = User.findOne;
        originalUserFindById = User.findById;
        originalUserSave = User.prototype.save;

        User.findOne = async function (filter) {
            if (filter.email) {
                const found = usersStore.find(u => u.email === filter.email);
                return found || null;
            }
            return null;
        };

        User.findById = async function (id) {
            const found = usersStore.find(u => u._id.toString() === id.toString());
            return found || null;
        };

        User.prototype.save = async function () {
            if (!this._id) this._id = new mongoose.Types.ObjectId();
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            usersStore.push(this);
            return this;
        };

        // Stub WardrobeItem methods
        originalWardrobeFind = WardrobeItem.find;
        originalWardrobeSave = WardrobeItem.prototype.save;
        originalWardrobeFindOneAndDelete = WardrobeItem.findOneAndDelete;
        originalWardrobeFindOneAndUpdate = WardrobeItem.findOneAndUpdate;

        WardrobeItem.find = function (query = {}) {
            const filterItems = () => wardrobeStore.filter(item => {
                let match = true;
                if (query.userId && !item.userId.equals(query.userId)) match = false;
                if (query.season && item.season !== query.season) match = false;
                if (query.category && item.category !== query.category) match = false;
                return match;
            });
            const p = Promise.resolve(filterItems());
            p.sort = () => p;
            return p;
        };

        WardrobeItem.prototype.save = async function () {
            if (!this._id) this._id = new mongoose.Types.ObjectId();
            wardrobeStore.push(this);
            return this;
        };

        WardrobeItem.findOneAndDelete = async function (query) {
            const index = wardrobeStore.findIndex(item =>
                item._id.toString() === query._id.toString() &&
                item.userId.equals(query.userId)
            );
            if (index === -1) return null;
            return wardrobeStore.splice(index, 1)[0];
        };

        WardrobeItem.findOneAndUpdate = async function (query, updates, options) {
            const item = wardrobeStore.find(item =>
                item._id.toString() === query._id.toString() &&
                item.userId.equals(query.userId)
            );
            if (!item) return null;
            Object.assign(item, updates.$set || updates);
            return item;
        };
    });

    after(() => {
        // Restore methods
        User.findOne = originalUserFindOne;
        User.findById = originalUserFindById;
        User.prototype.save = originalUserSave;
        WardrobeItem.find = originalWardrobeFind;
        WardrobeItem.prototype.save = originalWardrobeSave;
        WardrobeItem.findOneAndDelete = originalWardrobeFindOneAndDelete;
        WardrobeItem.findOneAndUpdate = originalWardrobeFindOneAndUpdate;
    });

    let userACookie = '';
    let userBCookie = '';
    let userAItemId = '';

    it('1. Should register User A and set HttpOnly authentication cookie', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Alice Fashionista',
                email: 'alice@example.com',
                password: 'Password123!'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.name, 'Alice Fashionista');

        const cookies = res.headers['set-cookie'];
        assert.ok(cookies, 'set-cookie header should be present');
        assert.ok(cookies.some(c => c.includes('token=') && c.includes('HttpOnly')));

        userACookie = cookies.find(c => c.startsWith('token='));
    });

    it('2. Should reject duplicate registration with same email (409)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Alice Duplicate',
                email: 'alice@example.com',
                password: 'Password123!'
            });

        assert.equal(res.status, 409);
        assert.equal(res.body.success, false);
    });

    it('3. Should login User A with valid credentials and return user profile', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'alice@example.com',
                password: 'Password123!'
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.email, 'alice@example.com');
    });

    it('4. Should get authenticated user profile via /api/auth/me using HttpOnly cookie', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', userACookie);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.email, 'alice@example.com');
    });

    it('5. Should reject outfit recommendations when wardrobe is empty (400)', async () => {
        const res = await request(app)
            .post('/api/recommendations/outfit')
            .set('Cookie', userACookie)
            .send({ occasion: 'party', style: 'chic' });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.equal(res.body.code, 'EMPTY_WARDROBE');
        assert.ok(res.body.message.includes('wardrobe is empty'));
    });

    it('6. Should add a wardrobe item for User A', async () => {
        const res = await request(app)
            .post('/api/wardrobe')
            .set('Cookie', userACookie)
            .send({
                name: 'Silk Party Blouse',
                category: 'top',
                color: 'blue',
                pattern: 'solid',
                style: 'chic',
                season: 'summer',
                material: 'silk',
                imageUrl: '/uploads/silk-blouse.jpg'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.item.name, 'Silk Party Blouse');
        userAItemId = res.body.item._id.toString();
    });

    it('7. Should retrieve User A wardrobe items', async () => {
        const res = await request(app)
            .get('/api/wardrobe')
            .set('Cookie', userACookie);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.count, 1);
        assert.equal(res.body.items[0].name, 'Silk Party Blouse');
    });

    it('8. Register User B and verify USER DATA ISOLATION', async () => {
        const regB = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Bob Explorer',
                email: 'bob@example.com',
                password: 'Password123!'
            });

        assert.equal(regB.status, 201);
        userBCookie = regB.headers['set-cookie'].find(c => c.startsWith('token='));

        // User B's wardrobe MUST be empty (cannot see User A's items)
        const getB = await request(app)
            .get('/api/wardrobe')
            .set('Cookie', userBCookie);

        assert.equal(getB.status, 200);
        assert.equal(getB.body.count, 0);

        // User B attempts to delete User A's item -> MUST be rejected (404)
        const delB = await request(app)
            .delete(`/api/wardrobe/${userAItemId}`)
            .set('Cookie', userBCookie);

        assert.equal(delB.status, 404);

        // Verify User A's item still exists
        const checkA = await request(app)
            .get('/api/wardrobe')
            .set('Cookie', userACookie);

        assert.equal(checkA.body.count, 1);
    });

    it('9. User A deletes their own wardrobe item', async () => {
        const res = await request(app)
            .delete(`/api/wardrobe/${userAItemId}`)
            .set('Cookie', userACookie);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);

        const checkA = await request(app)
            .get('/api/wardrobe')
            .set('Cookie', userACookie);

        assert.equal(checkA.body.count, 0);
    });

    it('10. Should successfully logout and clear authentication cookie', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', userACookie);

        assert.equal(res.status, 200);
        const cookies = res.headers['set-cookie'];
        assert.ok(cookies.some(c => c.includes('token=;') || c.includes('Expires=')));
    });

    it('11. Should reject unauthenticated access to /api/wardrobe with 401', async () => {
        const res = await request(app)
            .get('/api/wardrobe');
        // No cookie or Authorization header

        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    it('12. Should reject /api/wardrobe/analyze with no image file (400)', async () => {
        // Re-login User B to get a fresh cookie since User A is logged out
        const loginB = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'Password123!' });

        const bobCookie = loginB.headers['set-cookie'].find(c => c.startsWith('token='));

        const res = await request(app)
            .post('/api/wardrobe/analyze')
            .set('Cookie', bobCookie);
        // No file attached

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.toLowerCase().includes('image'));
    });

    it('13. Should reject /api/wardrobe/analyze with invalid file type (400)', async () => {
        const loginB = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'Password123!' });

        const bobCookie = loginB.headers['set-cookie'].find(c => c.startsWith('token='));

        const res = await request(app)
            .post('/api/wardrobe/analyze')
            .set('Cookie', bobCookie)
            .attach('image', Buffer.from('not-an-image-data'), {
                filename: 'malware.exe',
                contentType: 'application/octet-stream'
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    it('14. Should reject /api/wardrobe/analyze with oversized image (400)', async () => {
        const loginB = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'Password123!' });

        const bobCookie = loginB.headers['set-cookie'].find(c => c.startsWith('token='));

        // Create a 6MB buffer (> 5MB limit)
        const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024, 0xff);

        const res = await request(app)
            .post('/api/wardrobe/analyze')
            .set('Cookie', bobCookie)
            .attach('image', oversizedBuffer, {
                filename: 'huge.jpg',
                contentType: 'image/jpeg'
            });

        assert.ok(
            res.status === 400 || res.status === 413,
            `Expected 400 or 413 for oversized image, got ${res.status}`
        );
        assert.equal(res.body.success, false);
    });

    it('15. User B cannot update User A\'s wardrobe item (404)', async () => {
        // First re-add User A's item
        const loginA = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'Password123!' });
        const cookieA = loginA.headers['set-cookie'].find(c => c.startsWith('token='));

        const addRes = await request(app)
            .post('/api/wardrobe')
            .set('Cookie', cookieA)
            .send({
                name: 'Red Scarf',
                category: 'accessory',
                color: 'red',
                season: 'winter',
                material: 'wool',
                imageUrl: '/uploads/scarf.jpg'
            });
        const itemId = addRes.body.item._id.toString();

        const loginB = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'Password123!' });
        const cookieB = loginB.headers['set-cookie'].find(c => c.startsWith('token='));

        // User B tries to update User A's item
        const res = await request(app)
            .put(`/api/wardrobe/${itemId}`)
            .set('Cookie', cookieB)
            .send({ name: 'Stolen Scarf' });

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
    });

    it('16. Should accept Bearer token Authorization header as auth fallback', async () => {
        const loginA = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'Password123!' });

        const bearerToken = loginA.body.token;
        assert.ok(bearerToken, 'Login response must include token for Bearer fallback');

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${bearerToken}`);
        // No cookie set

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.email, 'alice@example.com');
    });
});
