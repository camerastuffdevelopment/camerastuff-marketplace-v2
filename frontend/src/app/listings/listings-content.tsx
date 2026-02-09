'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'parts', label: 'Parts' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalListings, setTotalListings] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);

  // Count active filters
  const activeFilterCount = [search, category, condition, minPrice, maxPrice, location].filter(
    (f) => f
  ).length;

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category_id', category);
        if (condition) params.append('condition', condition);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (location) params.append('location', location);
        params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', '12');

        const response = await api.get(`/api/listings?${params.toString()}`);
        if (response.data.success) {
          setListings(response.data.data);
          setTotalListings(response.data.pagination?.total || 0);
          setTotalPages(response.data.pagination?.pages || 0);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [search, category, condition, minPrice, maxPrice, location, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Equipment</h1>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="cameras">Cameras</option>
                <option value="lenses">Lenses</option>
                <option value="lighting">Lighting</option>
                <option value="tripods">Tripods</option>
                <option value="bags">Bags</option>
                <option value="accessories">Accessories</option>
              </select>

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="parts">Parts</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <button
                type="submit"
                className="bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors col-span-2 md:col-span-1"
              >
                Search
              </button>
            </div>

            {/* Active Filters and Clear Button */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg border border-primary-200">
                <span className="text-sm text-primary-900 font-medium">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found. Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">Showing {listings.length} listings</p>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {listing.image_urls.length > 0 ? (
                      <Image
                        src={listing.image_urls[0]}
                        alt={listing.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                    {listing.is_featured && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                      {listing.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-primary-600">
                        R {listing.price_zar.toLocaleString()}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {listing.condition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{listing.location || 'Location not specified'}</span>
                      <span>{listing.view_count} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={listings.length < 12}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
