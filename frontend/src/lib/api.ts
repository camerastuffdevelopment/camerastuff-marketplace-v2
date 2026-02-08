import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.email) {
      // Note: In a real implementation, you'd store and use the JWT token from NextAuth
      // For now, this is a placeholder for token handling
      // const token = await getToken({ req });
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (redirect to login)
      console.error('Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
