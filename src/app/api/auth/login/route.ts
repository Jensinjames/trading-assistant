import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { signInSchema } from '@/types/auth';
import { prisma } from '@/server/db';
import { signJwtToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = signInSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signJwtToken({
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role as 'user' | 'admin',
    });

    // Create the response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email!,
        name: user.name!,
        role: user.role,
        settings: user.settings ? {
          openaiApiKey: user.settings.openaiApiKey ?? null,
          openaiOrganization: user.settings.openaiOrganization ?? null,
          openaiProjectId: user.settings.openaiProjectId ?? null,
          openaiModel: user.settings.openaiModel ?? 'gpt-3.5-turbo',
          tradingViewApiKey: user.settings.tradingViewApiKey ?? null,
          telegramBotToken: user.settings.telegramBotToken ?? null,
        } : undefined,
      },
      token
    });

    // Set the auth token cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate' },
      { status: 500 }
    );
  }
} 