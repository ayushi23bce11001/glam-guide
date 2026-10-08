import multer from 'multer';
import path from 'path';

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mime)) {
        const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error, false);
    }

    cb(null, true);
};

// Use memory storage so image buffer can be used directly for AI analysis and storage upload
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

// Middleware wrapper to catch Multer errors and return clean HTTP 400
export const handleUpload = (fieldName = 'image') => {
    const multerSingle = upload.single(fieldName);
    return (req, res, next) => {
        multerSingle(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File size exceeds 5 MB limit. Please upload a smaller image.'
                    });
                }
                if (err.code === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error uploading file'
                });
            }
            next();
        });
    };
};

export default handleUpload;
