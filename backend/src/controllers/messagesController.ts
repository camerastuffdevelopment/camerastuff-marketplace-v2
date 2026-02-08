import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { MessageResponse } from '../types';

const prisma = new PrismaClient();

// Validation schema
const SendMessageSchema = z.object({
  listing_id: z.string().min(1, 'Listing ID is required'),
  recipient_id: z.string().min(1, 'Recipient ID is required'),
  message_body: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  subject: z.string().optional(),
});

function formatMessageResponse(message: any): MessageResponse {
  return {
    id: message.id,
    listing_id: message.listing_id,
    sender_id: message.sender_id,
    recipient_id: message.recipient_id,
    message_body: message.message_body,
    read_at: message.read_at,
    created_at: message.created_at,
  };
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Validate request body
    const validatedData = SendMessageSchema.parse(req.body);

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listing_id },
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: validatedData.recipient_id },
    });

    if (!recipient) {
      res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
      return;
    }

    // Prevent sending message to yourself
    if (userId === validatedData.recipient_id) {
      res.status(400).json({
        success: false,
        error: 'You cannot send a message to yourself',
      });
      return;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        listing_id: validatedData.listing_id,
        sender_id: userId,
        recipient_id: validatedData.recipient_id,
        message_body: validatedData.message_body,
        subject: validatedData.subject,
      },
    });

    res.status(201).json({
      success: true,
      data: formatMessageResponse(message),
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
      return;
    }

    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { listing_id, user_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Build where clause - messages where user is involved
    const where: any = {
      listing_id: listing_id ? String(listing_id) : undefined,
      OR: [{ sender_id: userId }, { recipient_id: userId }],
    };

    // If querying for conversation with specific user
    if (user_id) {
      where.AND = [
        {
          OR: [
            { sender_id: userId, recipient_id: String(user_id) },
            { sender_id: String(user_id), recipient_id: userId },
          ],
        },
      ];
    }

    // Remove undefined values
    Object.keys(where).forEach((key) => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    // Fetch messages
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price_zar: true,
            },
          },
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_image_url: true,
            },
          },
          recipient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_image_url: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: messages.map((msg) => ({
        ...formatMessageResponse(msg),
        listing: msg.listing,
        sender: msg.sender,
        recipient: msg.recipient,
      })),
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
}

export async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Get unique conversations
    const conversations = await prisma.message.groupBy({
      by: ['listing_id'],
      where: {
        OR: [{ sender_id: userId }, { recipient_id: userId }],
      },
      _max: {
        created_at: true,
      },
      orderBy: {
        _max: {
          created_at: 'desc',
        },
      },
    });

    // Get full details for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get the most recent message in this conversation
        const latestMessage = await prisma.message.findFirst({
          where: {
            listing_id: conv.listing_id,
            OR: [{ sender_id: userId }, { recipient_id: userId }],
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price_zar: true,
                image_urls: true,
              },
            },
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                profile_image_url: true,
              },
            },
            recipient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                profile_image_url: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        });

        // Get unread count
        const unreadCount = await prisma.message.count({
          where: {
            listing_id: conv.listing_id,
            recipient_id: userId,
            read_at: null,
          },
        });

        // Determine the other participant
        const otherUser =
          latestMessage?.sender_id === userId
            ? latestMessage?.recipient
            : latestMessage?.sender;

        return {
          listing_id: conv.listing_id,
          listing: latestMessage?.listing,
          otherUser,
          lastMessage: latestMessage
            ? {
                id: latestMessage.id,
                message_body: latestMessage.message_body,
                sender_id: latestMessage.sender_id,
                created_at: latestMessage.created_at,
              }
            : null,
          unreadCount,
          updated_at: latestMessage?.created_at,
        };
      })
    );

    res.json({
      success: true,
      data: conversationDetails,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Check if message exists and user is recipient
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
      });
      return;
    }

    if (message.recipient_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to mark this message as read',
      });
      return;
    }

    // Mark as read
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { read_at: new Date() },
    });

    res.json({
      success: true,
      data: formatMessageResponse(updatedMessage),
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read',
    });
  }
}

export async function markConversationAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { listing_id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Mark all messages in this conversation as read
    await prisma.message.updateMany({
      where: {
        listing_id,
        recipient_id: userId,
        read_at: null,
      },
      data: { read_at: new Date() },
    });

    res.json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark conversation as read',
    });
  }
}
