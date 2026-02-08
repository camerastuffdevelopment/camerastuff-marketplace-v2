import { Request, Response } from 'express';
import { z } from 'zod';
import { uploadImage, uploadMultipleImages } from '../services/cloudinaryService';

// Validation schema
const UploadImageSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  folder: z.string().optional().default('marketplace'),
});

const UploadMultipleSchema = z.object({
  images: z.array(z.string()).min(1, 'At least one image is required').max(10, 'Maximum 10 images'),
  folder: z.string().optional().default('marketplace'),
});

export async function uploadSingleImage(req: Request, res: Response): Promise<void> {
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
    const validatedData = UploadImageSchema.parse(req.body);

    // Upload to Cloudinary
    const result = await uploadImage(validatedData.image, validatedData.folder);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message,
      });
      return;
    }

    console.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image',
    });
  }
}

export async function uploadMultiple(req: Request, res: Response): Promise<void> {
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
    const validatedData = UploadMultipleSchema.parse(req.body);

    // Upload all images to Cloudinary
    const results = await uploadMultipleImages(validatedData.images, validatedData.folder);

    res.status(201).json({
      success: true,
      data: results,
      message: `${results.length} image(s) uploaded successfully`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message,
      });
      return;
    }

    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images',
    });
  }
}
