import express from 'express';
import { getOutfitRecommendation } from '../controllers/recommendationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Outfit recommendations are strictly authenticated and use the user's actual wardrobe
router.post('/outfit', requireAuth, getOutfitRecommendation);

export default router;
