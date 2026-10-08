import express from 'express';
import {
    getWardrobe,
    addItem,
    updateItem,
    deleteItem,
    analyzeImage
} from '../controllers/wardrobeController.js';
import { requireAuth } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';

const router = express.Router();

// All wardrobe routes are strictly protected by JWT authentication
router.use(requireAuth);

router.get('/', getWardrobe);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/analyze', handleUpload('image'), analyzeImage);

export default router;
