import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings to access TradingView API key
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings?.tradingViewApiKey) {
      return NextResponse.json(
        { error: 'TradingView API key not configured' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') || 'BTCUSD';

    // Here you would integrate with TradingView API
    // For now, returning mock data
    const mockData = {
      symbol,
      price: 45000 + Math.random() * 1000,
      change: (Math.random() * 10) - 5,
      volume: Math.floor(Math.random() * 1000000000),
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 