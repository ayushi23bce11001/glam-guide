import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import wardrobeRoutes from './src/routes/wardrobeRoutes.js';
import recommendationRoutes from './src/routes/recommendationRoutes.js';
import errorHandler from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allowed origins for CORS (supports cookies with credentials: true)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5500',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            process.env.NODE_ENV !== 'production'
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers and cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static uploads (local wardrobe images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
const frontendDir = path.resolve(__dirname, '../glam-guide-frontend');
app.use(express.static(frontendDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Compatibility aliases for legacy endpoints
app.use('/signup', (req, res, next) => {
    req.url = '/register';
    authRoutes(req, res, next);
});
app.use('/login', (req, res, next) => {
    req.url = '/login';
    authRoutes(req, res, next);
});
app.use('/register', (req, res, next) => {
    req.url = '/register';
    authRoutes(req, res, next);
});
app.use('/forgot-password', (req, res, next) => {
    req.url = '/forgot-password';
    authRoutes(req, res, next);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Centralized error handling middleware
app.use(errorHandler);

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dbconnect';

// Check if running in test runner
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));

// Connect to MongoDB
if (!isTestMode) {
    mongoose.connect(MONGO_URL)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
        });

    app.listen(PORT, () => {
        console.log(`Glam Guide production server running on port ${PORT}`);
    });
}

export default app;
