import { Router } from 'express';
import {
  createListing,
  getListing,
  listListings,
  updateListing,
  deleteListing,
  getUserListings,
} from '../controllers/listingsController';
import { verifyAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, listListings);
router.get('/:id', optionalAuth, getListing);
router.get('/user/:userId', getUserListings);

// Protected routes
router.post('/', verifyAuth, createListing);
router.put('/:id', verifyAuth, updateListing);
router.delete('/:id', verifyAuth, deleteListing);

export default router;
