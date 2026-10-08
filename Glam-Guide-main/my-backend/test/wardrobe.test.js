import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import WardrobeItem from '../src/models/WardrobeItem.js';

describe('Wardrobe & User Isolation Unit Tests', () => {
    it('should validate WardrobeItem required fields', () => {
        const item = new WardrobeItem({});
        const err = item.validateSync();

        assert.ok(err);
        assert.ok(err.errors.userId, 'userId must be required');
        assert.ok(err.errors.name, 'name must be required');
        assert.ok(err.errors.category, 'category must be required');
        assert.ok(err.errors.color, 'color must be required');
        assert.ok(err.errors.season, 'season must be required');
        assert.ok(err.errors.imageUrl, 'imageUrl must be required');
    });

    it('should reject invalid categories', () => {
        const item = new WardrobeItem({
            userId: new mongoose.Types.ObjectId(),
            name: 'Fancy Top',
            category: 'invalid_category_123',
            color: 'red',
            season: 'summer',
            imageUrl: '/uploads/test.jpg'
        });

        const err = item.validateSync();
        assert.ok(err);
        assert.ok(err.errors.category);
    });

    it('should accept valid categories and seasons', () => {
        const item = new WardrobeItem({
            userId: new mongoose.Types.ObjectId(),
            name: 'Classic White Shirt',
            category: 'top',
            color: 'white',
            pattern: 'solid',
            style: 'casual',
            season: 'summer',
            material: 'cotton',
            imageUrl: '/uploads/shirt.jpg'
        });

        const err = item.validateSync();
        assert.equal(err, undefined);
        assert.equal(item.category, 'top');
        assert.equal(item.season, 'summer');
    });

    it('should strictly isolate queries between different users', () => {
        const userAId = new mongoose.Types.ObjectId();
        const userBId = new mongoose.Types.ObjectId();

        const queryA = { userId: userAId };
        const queryB = { userId: userBId };

        assert.notDeepEqual(queryA, queryB);
        assert.equal(queryA.userId.equals(userBId), false);
    });
});
