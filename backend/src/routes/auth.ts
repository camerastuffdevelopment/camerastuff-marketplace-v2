import { Router } from 'express';
import { signup, login, getCurrentUser, updateProfile } from '../controllers/authController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', verifyAuth, getCurrentUser);
router.put('/profile', verifyAuth, updateProfile);

export default router;
