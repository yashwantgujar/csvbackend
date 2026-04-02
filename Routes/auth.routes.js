import express from 'express';
import { login, registerUser, logout } from '../Controllers/authController.js';
import { authLimiter } from '../Middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;