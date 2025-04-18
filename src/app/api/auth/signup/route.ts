import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { signUpSchema } from '@/types/auth';

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
    
    // Create user and generate token
    const response = await AuthService.signUp(email, password, name);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: error.code === 'EMAIL_EXISTS' ? 409 : 500 }
    );
  }
} 