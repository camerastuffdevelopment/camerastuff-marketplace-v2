import { Router } from 'express';
import { uploadSingleImage, uploadMultiple } from '../controllers/uploadController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// All upload routes require authentication
router.use(verifyAuth);

// Upload single image
router.post('/image', uploadSingleImage);

// Upload multiple images
router.post('/images', uploadMultiple);

export default router;
