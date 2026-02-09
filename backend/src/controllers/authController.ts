import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config/env';
import { UserResponse } from '../types';
import { z } from 'zod';

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// Validation schemas
const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to create user response
function getUserResponse(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_image_url: user.profile_image_url,
    bio: user.bio,
    phone_number: user.phone_number,
    location: user.location,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };
}

// Generate JWT token
function generateToken(userId: string, email: string): string {
  return jwt.sign(
    {
      userId,
      email,
    },
    config.JWT_SECRET as Secret,
    {
      expiresIn: config.JWT_EXPIRE,
    } as any
  );
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = SignupSchema.parse(req.body) as any;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password_hash: hashedPassword,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email_verified: false,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        ...getUserResponse(user),
        token, // Frontend can use this token
      },
      message: 'Account created successfully. Please verify your email.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues?.[0]?.message || 'Validation error',
      });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during signup',
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = LoginSchema.parse(req.body) as any;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password_hash || ''
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data (without password)
    res.json({
      success: true,
      data: {
        ...getUserResponse(user),
        token,
      },
      message: 'Logged in successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.issues?.[0]?.message || 'Validation error',
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
    });
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: getUserResponse(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred',
    });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const { first_name, last_name, bio, phone_number, location, profile_image_url } = req.body;

    // Validate optional fields
    if (first_name && typeof first_name !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid first_name',
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(bio !== undefined && { bio }),
        ...(phone_number !== undefined && { phone_number }),
        ...(location !== undefined && { location }),
        ...(profile_image_url !== undefined && { profile_image_url }),
      },
    });

    res.json({
      success: true,
      data: getUserResponse(user),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while updating profile',
    });
  }
}
