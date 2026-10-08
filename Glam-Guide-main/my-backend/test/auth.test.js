import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import { requireAuth } from '../src/middleware/auth.js';

describe('Authentication & Security Unit Tests', () => {
    const testSecret = 'test_jwt_secret_key_12345';
    process.env.JWT_SECRET = testSecret;

    it('should correctly hash password with bcrypt', async () => {
        const rawPassword = 'StrongPassword123!';
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(rawPassword, salt);

        assert.notEqual(hashed, rawPassword);
        assert.ok(hashed.startsWith('$2'));

        const match = await bcrypt.compare(rawPassword, hashed);
        assert.equal(match, true);

        const mismatch = await bcrypt.compare('WrongPassword', hashed);
        assert.equal(mismatch, false);
    });

    it('should generate and verify valid JWT tokens', () => {
        const userId = '654321654321654321654321';
        const token = jwt.sign({ userId }, testSecret, { expiresIn: '1h' });

        const decoded = jwt.verify(token, testSecret);
        assert.equal(decoded.userId, userId);
    });

    it('should reject expired JWT tokens with 401', async () => {
        const userId = '654321654321654321654321';
        const expiredToken = jwt.sign({ userId }, testSecret, { expiresIn: '0s' });

        const req = {
            cookies: { token: expiredToken },
            headers: {}
        };

        let responseStatus = 0;
        let responseJson = null;

        const res = {
            status: (code) => {
                responseStatus = code;
                return {
                    json: (data) => {
                        responseJson = data;
                    }
                };
            }
        };

        await requireAuth(req, res, () => {});

        assert.equal(responseStatus, 401);
        assert.equal(responseJson.success, false);
        assert.ok(responseJson.message.toLowerCase().includes('expired'));
    });

    it('should reject requests without a token with 401', async () => {
        const req = {
            cookies: {},
            headers: {}
        };

        let responseStatus = 0;
        let responseJson = null;

        const res = {
            status: (code) => {
                responseStatus = code;
                return {
                    json: (data) => {
                        responseJson = data;
                    }
                };
            }
        };

        await requireAuth(req, res, () => {});

        assert.equal(responseStatus, 401);
        assert.equal(responseJson.success, false);
        assert.ok(responseJson.message.toLowerCase().includes('authentication required'));
    });

    it('should reject invalid/tampered tokens with 401', async () => {
        const req = {
            cookies: { token: 'tampered.token.value' },
            headers: {}
        };

        let responseStatus = 0;
        let responseJson = null;

        const res = {
            status: (code) => {
                responseStatus = code;
                return {
                    json: (data) => {
                        responseJson = data;
                    }
                };
            }
        };

        await requireAuth(req, res, () => {});

        assert.equal(responseStatus, 401);
        assert.equal(responseJson.success, false);
        assert.ok(responseJson.message.toLowerCase().includes('invalid'));
    });
});
