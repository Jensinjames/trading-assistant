import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import { ChatService } from '@/services/communication/chat';

// GET /api/chat/threads/[threadId]/messages - Get all messages in a thread
export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = params;
    const messages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
        threadId: threadId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    if (!messages.length) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat/threads/[threadId]/messages - Add a message to a thread
export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings?.openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set it in your settings.' },
        { status: 400 }
      );
    }

    const chatService = new ChatService(userSettings);
    const response = await chatService.processMessage(session.user.id, content, threadId);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 