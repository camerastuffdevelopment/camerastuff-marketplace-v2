'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

const CATEGORIES = [
  { id: 'cameras', name: 'Cameras' },
  { id: 'lenses', name: 'Lenses' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'tripods', name: 'Tripods & Stands' },
  { id: 'bags', name: 'Bags & Cases' },
  { id: 'accessories', name: 'Accessories' },
];

const CONDITIONS = ['new', 'excellent', 'good', 'fair', 'parts'];

interface FormData {
  title: string;
  description: string;
  category_id: string;
  condition: string;
  price_zar: string;
  location: string;
  specifications: Record<string, string>;
}

interface ImagePreview {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category_id: '',
    condition: 'good',
    price_zar: '',
    location: '',
    specifications: {},
  });

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please log in to create a listing</p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 10;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setImages((prev) => [
          ...prev,
          {
            file,
            preview,
            uploading: false,
            uploaded: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    e.target.value = '';
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) {
      throw new Error('At least one image is required');
    }

    const uploadedUrls: string[] = [];
    const imagesToUpload = images.filter((img) => !img.uploaded);

    for (let i = 0; i < imagesToUpload.length; i++) {
      const imagePreview = imagesToUpload[i];
      setUploadProgress(Math.round(((i + 1) / imagesToUpload.length) * 100));

      try {
        const response = await api.post('/api/upload/image', {
          image: imagePreview.preview,
          folder: 'marketplace/listings',
        });

        if (response.data.success) {
          uploadedUrls.push(response.data.data.secure_url);
          setImages((prev) =>
            prev.map((img) =>
              img === imagePreview
                ? { ...img, uploaded: true, uploading: false, url: response.data.data.secure_url }
                : img
            )
          );
        }
      } catch (error: any) {
        console.error('Image upload failed:', error);
        throw new Error(`Failed to upload image: ${error.response?.data?.error || error.message}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category_id) {
        throw new Error('Category is required');
      }
      if (!formData.price_zar) {
        throw new Error('Price is required');
      }
      if (parseFloat(formData.price_zar) <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Upload images
      setUploadProgress(0);
      const imageUrls = await uploadImages();

      // Create listing
      const response = await api.post('/api/listings', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        condition: formData.condition,
        price_zar: parseFloat(formData.price_zar),
        location: formData.location || undefined,
        image_urls: imageUrls,
        specifications:
          Object.keys(formData.specifications).length > 0
            ? formData.specifications
            : undefined,
      });

      if (response.data.success) {
        router.push(`/listings/${response.data.data.id}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/listings" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Create a New Listing</h1>
            <p className="text-gray-600 mt-2">Share your photography equipment with buyers</p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Images Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Images (Required)
              </label>

              {/* Image Upload Input */}
              <div className="mb-6">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <div className="text-center">
                    <p className="text-gray-600">Drag images here or click to select</p>
                    <p className="text-sm text-gray-500">Maximum 10 images, 5MB each</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">{images.length} image(s) selected</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {image.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                            </div>
                          )}
                          {image.uploaded && (
                            <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                              <span className="text-white font-bold">✓</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Uploading images...</p>
                        <p className="text-sm text-gray-600">{uploadProgress}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Canon EOS 5D Mark IV"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the equipment, its condition, included accessories, etc."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond.charAt(0).toUpperCase() + cond.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Location</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price_zar" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (ZAR)
                  </label>
                  <input
                    id="price_zar"
                    name="price_zar"
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.price_zar}
                    onChange={handleInputChange}
                    placeholder="e.g., 15000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Johannesburg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || images.length === 0}
                className="flex-1 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
