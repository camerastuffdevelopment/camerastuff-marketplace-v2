import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary from a base64 string or file path
 * @param imageData - Base64 encoded image or file path
 * @param folder - Cloudinary folder to upload to
 * @param publicId - Optional custom public ID
 * @returns Promise with upload result containing secure_url
 */
export async function uploadImage(
  imageData: string,
  folder: string = 'marketplace',
  publicId?: string
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      quality: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Handle base64 data URI
    let uploadData = imageData;
    if (imageData.startsWith('data:')) {
      // It's a data URI, keep as is
      uploadData = imageData;
    } else if (imageData.startsWith('http')) {
      // It's a URL, Cloudinary will fetch it
      uploadData = imageData;
    } else {
      // Assume it's base64 without data URI prefix
      uploadData = `data:image/jpeg;base64,${imageData}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Upload multiple images
 * @param images - Array of base64 images
 * @param folder - Cloudinary folder to upload to
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  images: string[],
  folder: string = 'marketplace'
): Promise<{ secure_url: string; public_id: string }[]> {
  try {
    const uploadPromises = images.map((image) =>
      uploadImage(image, folder)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Failed to upload one or more images');
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Get image URL with transformations
 * @param publicId - Public ID of the image
 * @param width - Optional width for transformation
 * @param height - Optional height for transformation
 * @returns Transformed image URL
 */
export function getTransformedImageUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  const transformations = [];

  if (width || height) {
    transformations.push({
      width: width || 'auto',
      height: height || 'auto',
      crop: 'fill',
      quality: 'auto',
    });
  }

  return cloudinary.url(publicId, {
    transformations,
    secure: true,
  });
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getTransformedImageUrl,
};
