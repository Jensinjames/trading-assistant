import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createThread, getTradingAssistant } from '@/lib/trading-assistant';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create new thread
    const thread = await createThread({
      userId: session.user.id,
      title,
    });

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error creating chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to create chat thread' },
      { status: 500 }
    );
  }
}