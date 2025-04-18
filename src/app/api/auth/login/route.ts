import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { loginSchema } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    
    // Authenticate user and generate token
    const response = await AuthService.login(email, password);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log in' },
      { status: error.code === 'INVALID_CREDENTIALS' ? 401 : 500 }
    );
  }
} 