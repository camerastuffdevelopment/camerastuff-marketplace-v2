import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ListingResponse } from '../types';
import { config } from '../config/env';

const prisma = new PrismaClient({
  // @ts-ignore - datasourceUrl is valid in Prisma 7
  datasourceUrl: config.DATABASE_URL,
});

// Validation schemas
const CreateListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'parts']),
  price_zar: z.number().positive('Price must be positive'),
  location: z.string().optional(),
  image_urls: z.array(z.string().url()).min(1, 'At least one image is required'),
  specifications: z.record(z.string(), z.any()).optional(),
});

const UpdateListingSchema = CreateListingSchema.partial();

const ListingQuerySchema = z.object({
  category_id: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
});

function formatListingResponse(listing: any): ListingResponse {
  return {
    id: listing.id,
    user_id: listing.user_id,
    title: listing.title,
    description: listing.description,
    category_id: listing.category_id,
    condition: listing.condition,
    price_zar: listing.price_zar,
    location: listing.location,
    image_urls: listing.image_urls,
    specifications: listing.specifications,
    is_active: listing.is_active,
    is_featured: listing.is_featured,
    is_promoted: listing.is_promoted,
    view_count: listing.view_count,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
  };
}

export async function createListing(req: Request, res: Response): Promise<void> {
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
    const validatedData = CreateListingSchema.parse(req.body) as any;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        user_id: userId,
        title: validatedData.title,
        description: validatedData.description,
        category_id: validatedData.category_id,
        condition: validatedData.condition,
        price_zar: validatedData.price_zar,
        location: validatedData.location,
        image_urls: validatedData.image_urls,
        specifications: validatedData.specifications,
      },
    });

    res.status(201).json({
      success: true,
      data: formatListingResponse(listing),
      message: 'Listing created successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues?.[0]?.message || 'Validation error',
      });
      return;
    }

    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listing',
    });
  }
}

export async function getListing(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as any;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            profile_image_url: true,
          },
        },
        category: true,
      },
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });

    res.json({
      success: true,
      data: {
        ...formatListingResponse(listing),
        seller: (listing as any).user,
      },
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing',
    });
  }
}

export async function listListings(req: Request, res: Response): Promise<void> {
  try {
    const query = ListingQuerySchema.parse(req.query) as any;
    const skip = (query.page - 1) * query.limit;

    // Build where clause
    const where: any = {
      is_active: true,
      status: 'active',
      deleted_at: null,
    };

    if (query.category_id) {
      where.category_id = query.category_id;
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.location) {
      where.location = {
        contains: query.location,
        mode: 'insensitive',
      };
    }

    if (query.minPrice || query.maxPrice) {
      where.price_zar = {};
      if (query.minPrice) where.price_zar.gte = query.minPrice;
      if (query.maxPrice) where.price_zar.lte = query.maxPrice;
    }

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build order by
    let orderBy: any = { created_at: 'desc' };
    switch (query.sort) {
      case 'oldest':
        orderBy = { created_at: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price_zar: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price_zar: 'desc' };
        break;
      default:
        break;
    }

    // Fetch listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_image_url: true,
            },
          },
          category: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const pages = Math.ceil(total / query.limit);

    res.json({
      success: true,
      data: listings.map(formatListingResponse),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues?.[0]?.message || 'Validation error',
      });
      return;
    }

    console.error('List listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
    });
  }
}

export async function updateListing(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params as any;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Check if listing exists and user is owner
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    if (listing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to update this listing',
      });
      return;
    }

    // Validate request body
    const validatedData = UpdateListingSchema.parse(req.body) as any;

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: validatedData as any,
    });

    res.json({
      success: true,
      data: formatListingResponse(updatedListing),
      message: 'Listing updated successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues?.[0]?.message || 'Validation error',
      });
      return;
    }

    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update listing',
    });
  }
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params as any;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Check if listing exists and user is owner
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    if (listing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this listing',
      });
      return;
    }

    // Soft delete
    const deletedListing = await prisma.listing.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    res.json({
      success: true,
      data: formatListingResponse(deletedListing),
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete listing',
    });
  }
}

export async function getUserListings(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: {
          user_id: userId,
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.listing.count({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: listings.map(formatListingResponse),
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user listings',
    });
  }
}
