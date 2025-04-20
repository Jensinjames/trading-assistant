import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { initializeTradingAssistant } from '@/lib/trading-assistant';
import { prisma } from '@/server/db';

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user settings to access OpenAI API key
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!userSettings?.openaiApiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not found in user settings' },
      { status: 400 }
    );
  }

  try {
    const assistant = await initializeTradingAssistant(userSettings.openaiApiKey);
    return NextResponse.json({ assistant });
  } catch (error) {
    console.error('Error initializing trading assistant:', error);
    return NextResponse.json(
      { error: 'Failed to initialize trading assistant' },
      { status: 500 }
    );
  }
} 