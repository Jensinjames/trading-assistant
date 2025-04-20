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

    // Here you would integrate with TradingView API to get real technical indicators
    // For now, returning mock data
    const mockData = {
      rsi: 50 + Math.random() * 20,
      macd: {
        value: (Math.random() * 100) - 50,
        signal: (Math.random() * 100) - 50,
        histogram: (Math.random() * 20) - 10,
      },
      movingAverages: {
        sma20: 45000 + Math.random() * 1000,
        sma50: 44000 + Math.random() * 1000,
        sma200: 43000 + Math.random() * 1000,
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching technical indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technical indicators' },
      { status: 500 }
    );
  }
} 