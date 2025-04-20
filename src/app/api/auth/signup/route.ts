import { NextResponse } from 'next/server';
import { signUpSchema } from '@/types/auth';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Validate password strength
    try {
      passwordSchema.parse(password);
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        settings: {
          create: {
            openaiModel: 'gpt-3.5-turbo',
            // Add other default settings as needed
          }
        }
      },
      include: {
        settings: true,
      },
    });

    // Return success without sensitive data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
} 