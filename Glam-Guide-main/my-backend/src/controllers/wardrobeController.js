import WardrobeItem from '../models/WardrobeItem.js';
import storageService from '../services/storageService.js';
import aiService from '../services/aiService.js';

/**
 * Get all wardrobe items for the authenticated user with optional filtering
 */
export const getWardrobe = async (req, res, next) => {
    try {
        const query = { userId: req.user._id };

        if (req.query.season && req.query.season !== 'all') {
            query.season = req.query.season.toLowerCase();
        }

        if (req.query.category && req.query.category !== 'all') {
            query.category = req.query.category.toLowerCase();
        }

        const items = await WardrobeItem.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: items.length,
            items
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new wardrobe item scoped to the authenticated user
 */
export const addItem = async (req, res, next) => {
    try {
        const {
            name,
            category,
            color,
            pattern,
            style,
            season,
            material,
            imageUrl
        } = req.body;

        if (!name || !category || !color || !season || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, color, season, and image URL are required.'
            });
        }

        const newItem = new WardrobeItem({
            userId: req.user._id,
            name: name.trim(),
            category: category.toLowerCase().trim(),
            color: color.toLowerCase().trim(),
            pattern: (pattern || 'solid').toLowerCase().trim(),
            style: (style || 'casual').toLowerCase().trim(),
            season: season.toLowerCase().trim(),
            material: (material || 'cotton').toLowerCase().trim(),
            imageUrl
        });

        await newItem.save();

        return res.status(201).json({
            success: true,
            message: 'Wardrobe item added successfully.',
            item: newItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing wardrobe item (scoped to owner)
 */
export const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent changing ownership
        delete updates.userId;
        delete updates._id;

        const item = await WardrobeItem.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Wardrobe item not found or you are not authorized to modify it.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Wardrobe item updated successfully.',
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a wardrobe item (scoped to owner)
 */
export const deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;

        const item = await WardrobeItem.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Wardrobe item not found or you are not authorized to delete it.'
            });
        }

        // Clean up stored image file if local
        if (item.imageUrl) {
            await storageService.deleteStoredImage(item.imageUrl);
        }

        return res.status(200).json({
            success: true,
            message: 'Wardrobe item deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload clothing image and run AI image analysis to detect attributes.
 * AI analysis runs FIRST; image is only stored if Gemini succeeds.
 */
export const analyzeImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image file to analyze.'
            });
        }

        // 1. Analyze with Gemini AI first (do not store if this fails)
        const detectedAttributes = await aiService.analyzeClothingImage(
            req.file.buffer,
            req.file.mimetype
        );

        // 2. Store the image only after successful AI analysis
        const imageUrl = await storageService.storeImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        return res.status(200).json({
            success: true,
            message: 'Clothing analyzed successfully.',
            imageUrl,
            attributes: detectedAttributes
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getWardrobe,
    addItem,
    updateItem,
    deleteItem,
    analyzeImage
};
