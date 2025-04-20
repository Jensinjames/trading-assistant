import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, content, category = 'general' } = await req.json();
    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Thread ID and content are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the thread and its associated assistant
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { assistant: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Create the user's message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        userId: user.id,
        threadId,
        assistantId: thread.assistantId,
        category,
      },
    });

    // Mock assistant response based on category
    const mockResponse = `This is a mock response for category: ${category}`;

    // Create the assistant's response
    const assistantMessage = await prisma.message.create({
      data: {
        content: mockResponse,
        role: 'assistant',
        userId: user.id,
        threadId,
        assistantId: thread.assistantId,
        category,
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error('Error in message route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 