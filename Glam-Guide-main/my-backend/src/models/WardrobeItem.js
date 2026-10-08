import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['top', 'bottom', 'outerwear', 'dress', 'footwear', 'accessory', 'other'],
        lowercase: true,
        trim: true
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true,
        lowercase: true
    },
    pattern: {
        type: String,
        default: 'solid',
        trim: true,
        lowercase: true
    },
    style: {
        type: String,
        default: 'casual',
        trim: true,
        lowercase: true
    },
    season: {
        type: String,
        required: [true, 'Season is required'],
        enum: ['winter', 'spring', 'summer', 'fall', 'all-season'],
        lowercase: true,
        trim: true
    },
    material: {
        type: String,
        default: 'cotton',
        trim: true,
        lowercase: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);
export default WardrobeItem;
