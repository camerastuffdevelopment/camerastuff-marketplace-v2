# Image Upload Feature Guide

## Overview

The marketplace now has complete image upload functionality with Cloudinary integration. Users can upload images when creating and browsing listings with preview capabilities.

## Features Implemented

### Backend

**Cloudinary Service** (`src/services/cloudinaryService.ts`):
- Upload single/multiple images
- Handle base64 data URIs from frontend
- Organize images in folders (marketplace/listings)
- Delete images from Cloudinary
- Transform images with custom dimensions
- Secure URL generation

**Upload Controller** (`src/controllers/uploadController.ts`):
- `/api/upload/image` - Upload single image
- `/api/upload/images` - Upload multiple images (up to 10)
- Authentication required on all endpoints
- Validation (5MB max, image types only)
- Zod schema validation

### Frontend

**Create Listing Page** (`src/app/listings/create/page.tsx`):
- Drag-and-drop image upload
- Click-to-select file interface
- Multi-image support (up to 10 images)
- Image preview grid
- Individual image removal
- Upload progress bar (0-100%)
- Upload status indicators (uploading, uploaded, error)
- Form validation before submission
- Complete listing form (title, description, category, condition, price, location)

**Edit Listing Page** (`src/app/listings/[id]/edit/page.tsx`):
- View current images in gallery
- Update listing details
- Note: Image replacement requires creating new listing
- Form validation
- Owner-only access

## How to Use

### Setup

1. **Get Cloudinary Account**:
   ```bash
   # Sign up at https://cloudinary.com
   # Get your credentials from the dashboard
   ```

2. **Configure Environment Variables**:
   ```bash
   # backend/.env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Test Upload**:
   ```bash
   npm run dev  # Start backend
   npm run dev  # Start frontend (separate terminal)
   ```

### Creating a Listing with Images

1. **Navigate to Create Listing**:
   - Go to `http://localhost:3000/listings/create`
   - Or click "Sell Gear" in navigation

2. **Upload Images**:
   - Drag images into the upload area, or
   - Click to select files from computer
   - Maximum 10 images, 5MB each
   - Supported formats: JPG, PNG, GIF, WebP

3. **Image Processing**:
   - Preview displays immediately (client-side)
   - Images convert to base64 automatically
   - Base64 data sent to backend
   - Backend uploads to Cloudinary
   - Progress bar shows upload status
   - Checkmark appears when uploaded

4. **Fill Listing Details**:
   - Title (required, 5+ characters)
   - Description (required, 20+ characters)
   - Category (required)
   - Condition (required)
   - Price in ZAR (required, > 0)
   - Location (optional)

5. **Submit**:
   - Click "Create Listing"
   - All images upload to Cloudinary
   - Listing created with image URLs
   - Redirect to listing detail page

### Editing a Listing

1. **Navigate to Edit**:
   - Go to listing detail page
   - Click "✏️ Edit Listing" button (visible for owners only)

2. **Update Details**:
   - Modify title, description, price, etc.
   - Current images displayed for reference

3. **Image Updates**:
   - To change images, delete and recreate listing
   - Or implement image replacement in Phase 2

## API Endpoints

### Upload Single Image
```bash
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "folder": "marketplace"  // optional
}

Response:
{
  "success": true,
  "data": {
    "secure_url": "https://res.cloudinary.com/...",
    "public_id": "marketplace/..."
  }
}
```

### Upload Multiple Images
```bash
POST /api/upload/images
Authorization: Bearer {token}
Content-Type: application/json

{
  "images": [
    "data:image/jpeg;base64,...",
    "data:image/png;base64,..."
  ],
  "folder": "marketplace"  // optional
}

Response:
{
  "success": true,
  "data": [
    { "secure_url": "...", "public_id": "..." },
    { "secure_url": "...", "public_id": "..." }
  ]
}
```

## Database

**Listings Table**:
- `image_urls` (String[]) - Array of Cloudinary URLs
- Stores secure URLs, not file uploads

Example:
```json
{
  "image_urls": [
    "https://res.cloudinary.com/xyz/image/upload/v123/marketplace/abc.jpg",
    "https://res.cloudinary.com/xyz/image/upload/v123/marketplace/def.jpg"
  ]
}
```

## Image URL Structure

Cloudinary URL format:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/marketplace/{public_id}.jpg
```

**Transformations** (available for future use):
- Width/Height: `w_300,h_300`
- Quality: `q_auto`
- Crop: `c_fill`
- Format: `f_auto`

Example optimized URL:
```
https://res.cloudinary.com/xyz/image/upload/w_500,h_500,q_auto,c_fill,f_auto/marketplace/listings/img.jpg
```

## Error Handling

### Common Errors

**File Too Large**:
```
Error: Image size must be less than 5MB
```
Solution: Compress image before upload

**Invalid File Type**:
```
Error: Only image files are allowed
```
Solution: Use JPG, PNG, GIF, or WebP format

**No Images Selected**:
```
Error: At least one image is required
```
Solution: Upload at least 1 image before creating listing

**Cloudinary Upload Failed**:
```
Error: Failed to upload image to Cloudinary
```
Solution:
- Check Cloudinary credentials in .env
- Verify Cloudinary account has API access
- Check network connection

**Unauthorized**:
```
Error: Not authenticated
```
Solution: Log in before creating listings

## Testing

### Manual Testing Checklist

- [ ] Upload single image - verify displays and uploads
- [ ] Upload multiple images - verify all display and upload
- [ ] Remove image before upload - verify it's removed
- [ ] Cancel upload - verify form remains usable
- [ ] Submit with images - verify listing created with images
- [ ] View listing - verify images display correctly
- [ ] Check Cloudinary dashboard - verify images stored
- [ ] Edit listing - verify can modify details
- [ ] Test 5MB+ image - verify error shown
- [ ] Test non-image file - verify rejected

### Load Testing

- Upload 50 images to Cloudinary
- Create listings with 10 images each
- Monitor upload speed
- Check Cloudinary storage usage
- Verify CDN serving images efficiently

## Best Practices

1. **Image Naming**:
   - Cloudinary generates public IDs automatically
   - Images stored under `marketplace/listings/` folder

2. **Storage Organization**:
   - Keep images organized by folder
   - Easy to delete by folder if needed

3. **Performance**:
   - Cloudinary handles CDN delivery automatically
   - Images served from nearest edge location
   - No performance impact on backend

4. **Security**:
   - URLs are public but secure
   - All uploads require authentication
   - Images can only be deleted by owner (when deleting listing)

5. **Future Enhancements**:
   - Image optimization on upload
   - Thumbnail generation
   - Progressive JPEG
   - WebP format support
   - Image cropping/rotation on create page

## Phase 2 Enhancements

- [ ] Image editing tools (crop, rotate, filter)
- [ ] Bulk image deletion
- [ ] Image reordering/sorting
- [ ] Image compression optimization
- [ ] Watermarking
- [ ] Copy images when editing
- [ ] Image gallery lightbox viewer
- [ ] Drag-to-reorder images

## Troubleshooting

### Images Not Uploading

1. Check network tab in browser DevTools
2. Verify Cloudinary API key is correct
3. Check backend logs for errors
4. Ensure file is under 5MB

### Slow Upload Speed

1. Optimize image before upload (compress)
2. Check internet connection
3. Check Cloudinary dashboard for issues
4. Consider reducing image count

### Images Not Displaying

1. Check if URLs are HTTPS
2. Verify Cloudinary URLs in database
3. Check browser console for errors
4. Verify Cloudinary account status

### Memory Issues

1. Large images loaded as base64 may use memory
2. Solution: Limit preview to thumbnails
3. Compress before upload in Phase 2

## API Documentation

See `/api/upload/` endpoints for complete API reference.

## Files Modified

- `backend/src/services/cloudinaryService.ts` - Upload service
- `backend/src/controllers/uploadController.ts` - Upload endpoints
- `backend/src/routes/upload.ts` - Upload routes
- `backend/src/index.ts` - Mount upload routes
- `frontend/src/app/listings/create/page.tsx` - Create listing form
- `frontend/src/app/listings/[id]/edit/page.tsx` - Edit listing form
- `frontend/src/app/page.tsx` - Navigation links

## Related Documentation

- [MVP Status](./MVP_STATUS.md) - Project overview
- [Testing Guide](./TESTING.md) - Testing procedures
- [CLAUDE.md](./CLAUDE.md) - Developer guide
