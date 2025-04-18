import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate token and get user info
    const user = await AuthService.validateToken(token);
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
} 