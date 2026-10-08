import express from 'express';
import { register, login, getMe, logout, forgotPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
