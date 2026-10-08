import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'glam_guide_jwt_default_secret_key';

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    const token = jwt.sign(
        { userId: user._id },
        getJwtSecret(),
        { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(statusCode).json({
        success: true,
        message,
        token, // returned for clients that also wish to set an Authorization header
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        await user.save();
        return sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Glam Guide.');
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        return sendTokenResponse(user, 200, res, 'Login successful.');
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            createdAt: req.user.createdAt
        }
    });
};

export const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax'
    });

    return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required.'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'If an account exists with this email address, password reset instructions have been sent.'
    });
};

export default {
    register,
    login,
    getMe,
    logout,
    forgotPassword
};
