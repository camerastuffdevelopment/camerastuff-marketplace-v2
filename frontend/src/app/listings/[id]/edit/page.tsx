'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Listing } from '@/types';

const CATEGORIES = [
  { id: 'cameras', name: 'Cameras' },
  { id: 'lenses', name: 'Lenses' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'tripods', name: 'Tripods & Stands' },
  { id: 'bags', name: 'Bags & Cases' },
  { id: 'accessories', name: 'Accessories' },
];

const CONDITIONS = ['new', 'excellent', 'good', 'fair', 'parts'];

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    condition: 'good',
    price_zar: '',
    location: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/listings/${params.id}`);
        if (response.data.success) {
          const data = response.data.data;
          setListing(data);
          setFormData({
            title: data.title,
            description: data.description,
            category_id: data.category_id || '',
            condition: data.condition,
            price_zar: data.price_zar.toString(),
            location: data.location || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please log in to edit a listing</p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Listing not found</p>
          <Link href="/listings" className="text-primary-600 hover:text-primary-700 font-semibold">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  // Check ownership
  if (listing.user_id !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">You don't have permission to edit this listing</p>
          <Link href={`/listings/${params.id}`} className="text-primary-600 hover:text-primary-700 font-semibold">
            Back to listing
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

      // Update listing
      const response = await api.put(`/api/listings/${params.id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        condition: formData.condition,
        price_zar: parseFloat(formData.price_zar),
        location: formData.location || undefined,
      });

      if (response.data.success) {
        router.push(`/listings/${params.id}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/listings/${params.id}`} className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
          ← Back to listing
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-gray-600 mt-2">Update your equipment listing details</p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Current Images Preview */}
          {listing.image_urls.length > 0 && (
            <div className="p-6 md:p-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.image_urls.map((url, index) => (
                  <div key={index} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <Image src={url} alt={`Listing ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: Image updates require creating a new listing
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
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
                disabled={isSubmitting}
                className="flex-1 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
