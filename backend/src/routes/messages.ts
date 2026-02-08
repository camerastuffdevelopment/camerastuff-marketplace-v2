import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  markConversationAsRead,
} from '../controllers/messagesController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(verifyAuth);

// Send a message
router.post('/', sendMessage);

// Get messages (with filtering by listing_id and/or user_id)
router.get('/', getMessages);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Mark a single message as read
router.put('/:id/read', markAsRead);

// Mark all messages in a conversation as read
router.put('/conversation/:listing_id/read', markConversationAsRead);

export default router;
