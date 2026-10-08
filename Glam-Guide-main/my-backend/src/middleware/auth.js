import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
    try {
        let token = null;

        // 1. Check HttpOnly cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // 2. Check Authorization Bearer header as fallback
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        const secret = process.env.JWT_SECRET || 'glam_guide_jwt_default_secret_key';
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token. Please log in again.'
            });
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Malformed authentication token.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists or session is invalid.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

export default requireAuth;
