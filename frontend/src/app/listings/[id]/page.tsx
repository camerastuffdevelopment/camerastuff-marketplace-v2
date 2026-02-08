'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Listing } from '@/types';

interface ListingDetail extends Listing {
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
  };
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/listings/${params.id}`);
        if (response.data.success) {
          setListing(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/listings/${params.id}`);
      if (response.data.success) {
        router.push('/listings');
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const isOwner = session?.user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <Link href="/listings" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 md:p-8">
            {/* Main Image */}
            <div className="md:col-span-2">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
                {listing.image_urls.length > 0 ? (
                  <Image
                    src={listing.image_urls[activeImage]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {listing.image_urls.length > 1 && (
                <div className="flex gap-2">
                  {listing.image_urls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImage === idx ? 'border-primary-600' : 'border-gray-300'
                      }`}
                    >
                      <Image src={url} alt={`${listing.title} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {listing.is_featured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-semibold text-sm">Featured Listing</p>
                </div>
              )}

              <div>
                <p className="text-gray-500 text-sm">Condition</p>
                <p className="text-xl font-semibold text-gray-900 capitalize">{listing.condition}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Price</p>
                <p className="text-3xl font-bold text-primary-600">R {listing.price_zar.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Location</p>
                <p className="text-lg font-semibold text-gray-900">{listing.location || 'Not specified'}</p>
              </div>

              {/* Seller Card */}
              {listing.seller && (
                <Link href={`/profile/${listing.seller.id}`} className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                  <p className="text-gray-500 text-sm mb-2">Seller</p>
                  <div className="flex items-center gap-3">
                    {listing.seller.profile_image_url && (
                      <Image
                        src={listing.seller.profile_image_url}
                        alt={listing.seller.first_name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {listing.seller.first_name} {listing.seller.last_name}
                      </p>
                      <p className="text-xs text-primary-600">View profile</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Action Buttons */}
              {isOwner ? (
                <div className="space-y-2">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="block w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    ✏️ Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : '🗑️ Delete Listing'}
                  </button>
                </div>
              ) : (
                <Link
                  href={`/messages?listing_id=${listing.id}&user_id=${listing.user_id}`}
                  className="block w-full bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                >
                  💬 Send Message to Seller
                </Link>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 border-t border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Specifications */}
            {listing.specifications && Object.keys(listing.specifications).length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(listing.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="font-semibold text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div>
                  <p className="text-gray-600 font-semibold">{listing.view_count} views</p>
                </div>
                <div>
                  <p>
                    Posted {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p>ID: {listing.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings Placeholder */}
        <div className="mt-12 text-center text-gray-500">
          <p>More features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
