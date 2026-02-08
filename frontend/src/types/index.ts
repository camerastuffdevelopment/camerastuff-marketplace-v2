// User type
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  bio: string | null;
  phone_number: string | null;
  location: string | null;
  email_verified: boolean;
  created_at: string;
}

// Listing type
export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string | null;
  condition: string;
  price_zar: number;
  location: string | null;
  image_urls: string[];
  specifications: Record<string, unknown> | null;
  is_active: boolean;
  is_featured: boolean;
  is_promoted: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Message type
export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  message_body: string;
  read_at: string | null;
  created_at: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Session type for NextAuth
export interface Session {
  user?: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    token?: string; // JWT token for API requests
  };
  expires: string;
}
