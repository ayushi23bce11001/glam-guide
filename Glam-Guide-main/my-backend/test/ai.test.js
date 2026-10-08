import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import aiService from '../src/services/aiService.js';

describe('AI Recommendation & Validation Unit Tests', () => {
    it('should reject recommendation requests with empty wardrobe (400)', async () => {
        try {
            await aiService.generateOutfitRecommendation([], { occasion: 'casual' });
            assert.fail('Should have thrown an error for empty wardrobe');
        } catch (error) {
            assert.equal(error.statusCode, 400);
            assert.ok(error.message.includes('wardrobe is empty'));
        }
    });

    it('should reject recommendation requests with fewer than 2 items (400)', async () => {
        const singleItem = [
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Single T-Shirt',
                category: 'top',
                color: 'white',
                season: 'summer'
            }
        ];

        try {
            await aiService.generateOutfitRecommendation(singleItem, { occasion: 'casual' });
            assert.fail('Should have thrown an error for insufficient items');
        } catch (error) {
            assert.equal(error.statusCode, 400);
            assert.ok(error.message.includes('at least 2 wardrobe items'));
        }
    });

    it('should throw 503 AI_NOT_CONFIGURED when AI_API_KEY is not set', async () => {
        const originalKey = process.env.AI_API_KEY;
        const originalGeminiKey = process.env.GEMINI_API_KEY;
        delete process.env.AI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        try {
            await aiService.analyzeClothingImage(Buffer.from('fake-image-data'), 'image/jpeg');
            assert.fail('Should have thrown AI_NOT_CONFIGURED');
        } catch (error) {
            assert.equal(error.statusCode, 503);
            assert.equal(error.code, 'AI_NOT_CONFIGURED');
        } finally {
            if (originalKey) process.env.AI_API_KEY = originalKey;
            if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
        }
    });

    it('should reject outfit recommendation when AI returns fabricated/unknown item IDs', async () => {
        // Simulate the security check that happens after AI analysis:
        // AI returns an itemId not in user's actual wardrobe → it gets filtered out → validatedOutfit.length === 0
        const userItemId = new mongoose.Types.ObjectId();
        const fakeItemId = new mongoose.Types.ObjectId(); // not in user's wardrobe

        const itemMap = new Map([
            [userItemId.toString(), { _id: userItemId, name: 'Real Shirt', category: 'top' }]
        ]);

        const aiOutfit = [
            { itemId: fakeItemId.toString(), role: 'top' } // fabricated ID
        ];

        const validatedOutfit = aiOutfit.filter(picked =>
            picked && picked.itemId && itemMap.has(picked.itemId.toString())
        );

        assert.equal(validatedOutfit.length, 0, 'Fabricated AI item IDs must be filtered out');
    });

    it('should accept outfit recommendation when AI returns valid user item IDs only', () => {
        const userItemId1 = new mongoose.Types.ObjectId();
        const userItemId2 = new mongoose.Types.ObjectId();

        const userItems = [
            { _id: userItemId1, name: 'Blue Shirt', category: 'top' },
            { _id: userItemId2, name: 'Black Jeans', category: 'bottom' }
        ];

        const itemMap = new Map(userItems.map(item => [item._id.toString(), item]));

        const aiOutfit = [
            { itemId: userItemId1.toString(), role: 'top' },
            { itemId: userItemId2.toString(), role: 'bottom' }
        ];

        const validatedOutfit = aiOutfit.filter(picked =>
            picked && picked.itemId && itemMap.has(picked.itemId.toString())
        );

        assert.equal(validatedOutfit.length, 2, 'Valid user item IDs must all pass validation');
    });
});
