import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary credentials are provided
const hasCloudinary = Boolean(
    process.env.STORAGE_CLOUD_NAME &&
    process.env.STORAGE_API_KEY &&
    process.env.STORAGE_API_SECRET
);

if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.STORAGE_CLOUD_NAME,
        api_key: process.env.STORAGE_API_KEY,
        api_secret: process.env.STORAGE_API_SECRET,
        secure: true
    });
}

/**
 * Upload an image buffer to Cloudinary or fallback to local disk storage
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} originalName - Original filename
 * @param {string} mimeType - Image mime type
 * @returns {Promise<string>} Public URL of stored image
 */
export const storeImage = async (buffer, originalName, mimeType) => {
    if (hasCloudinary) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'glam_guide_wardrobe',
                    resource_type: 'image',
                    format: mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Cloud storage upload failed'));
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );
            stream.end(buffer);
        });
    }

    // Local disk storage fallback
    const ext = path.extname(originalName).toLowerCase() || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `wardrobe-${Date.now()}-${randomHex}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
};

/**
 * Delete an image if stored locally
 * @param {string} imageUrl
 */
export const deleteStoredImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        if (imageUrl.startsWith('/uploads/')) {
            const filename = path.basename(imageUrl);
            const filePath = path.join(uploadsDir, filename);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        }
    } catch (err) {
        console.warn('Failed to delete image file:', err.message);
    }
};

export default {
    storeImage,
    deleteStoredImage
};
