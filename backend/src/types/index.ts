// JWT Payload type for authentication
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// User response type (without sensitive data)
export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  bio: string | null;
  phone_number: string | null;
  location: string | null;
  email_verified: boolean;
  created_at: Date;
}

// Listing response type
export interface ListingResponse {
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
  created_at: Date;
  updated_at: Date;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination type
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

// Message response type
export interface MessageResponse {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  message_body: string;
  read_at: Date | null;
  created_at: Date;
}
