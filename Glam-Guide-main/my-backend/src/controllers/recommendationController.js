import WardrobeItem from '../models/WardrobeItem.js';
import aiService from '../services/aiService.js';

/**
 * Generate personalized outfit recommendation using authenticated user's actual wardrobe
 */
export const getOutfitRecommendation = async (req, res, next) => {
    try {
        const { occasion, style, bodyType, season } = req.body;

        // Fetch user's actual items from MongoDB
        const rawItems = await WardrobeItem.find({ userId: req.user._id });
        const userItems = Array.isArray(rawItems) ? rawItems : [];

        if (!userItems || userItems.length === 0) {
            return res.status(400).json({
                success: false,
                code: 'EMPTY_WARDROBE',
                message: 'Your wardrobe is empty. Add some clothing items first so Glam Guide can create an outfit for you.'
            });
        }

        if (userItems.length < 2) {
            return res.status(400).json({
                success: false,
                code: 'INSUFFICIENT_ITEMS',
                message: 'You need at least 2 wardrobe items (such as a top and a bottom, or a dress and footwear) to generate an outfit recommendation.'
            });
        }

        const recommendation = await aiService.generateOutfitRecommendation(userItems, {
            occasion: (occasion || 'casual').toLowerCase(),
            style: (style || 'casual').toLowerCase(),
            bodyType: (bodyType || 'all').toLowerCase(),
            season: season ? season.toLowerCase() : undefined
        });

        return res.status(200).json({
            success: true,
            recommendation
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getOutfitRecommendation
};
