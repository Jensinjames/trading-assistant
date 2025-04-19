import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import type { PrismaClient } from '@prisma/client';

interface Message {
  id: string;
  userId: string;
  threadId: string | null;
  role: string;
  content: string;
  createdAt: Date;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// GET /api/chat/threads - Get all threads for a user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all messages for the user
    const messages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Group messages by conversation
    const threads = new Map<string, Thread>();
    
    messages.forEach((message: Message) => {
      const threadId = message.threadId || message.id;
      if (!threads.has(threadId)) {
        threads.set(threadId, {
          id: threadId,
          title: message.content.slice(0, 30) + (message.content.length > 30 ? '...' : ''),
          messages: [],
          createdAt: message.createdAt.getTime(),
          updatedAt: message.createdAt.getTime(),
        });
      }
      
      const thread = threads.get(threadId)!;
      thread.messages.push(message);
      
      // Update thread metadata
      if (message.createdAt.getTime() < thread.createdAt) {
        thread.createdAt = message.createdAt.getTime();
      }
      if (message.createdAt.getTime() > thread.updatedAt) {
        thread.updatedAt = message.createdAt.getTime();
        // Update title from the first user message
        if (message.role === 'user') {
          thread.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
      }
    });
    
    // Convert to array and sort by most recent
    const threadArray = Array.from(threads.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
    
    return NextResponse.json(threadArray);
  } catch (error) {
    console.error('Error fetching chat threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat threads' },
      { status: 500 }
    );
  }
}

// POST /api/chat/threads - Create a new thread
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a new thread ID
    const threadId = await prisma.$transaction(async (tx: PrismaClient) => {
      // Create initial assistant message
      const message = await tx.message.create({
        data: {
          userId: session.user.id,
          role: 'assistant',
          content: "Hello! I'm your trading assistant. How can I help you with your cryptocurrency trading today?",
          threadId: undefined, // Will be updated
        },
      });

      // Update the message with its own ID as the threadId
      await tx.message.update({
        where: { id: message.id },
        data: { threadId: message.id },
      });

      return message.id;
    });

    // Fetch the created thread
    const messages = await prisma.message.findMany({
      where: {
        threadId: threadId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const thread = {
      id: threadId,
      title: 'New Conversation',
      messages: messages,
      createdAt: messages[0].createdAt.getTime(),
      updatedAt: messages[0].createdAt.getTime(),
    };

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to create chat thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/threads/[threadId] - Delete a thread
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = await request.json();
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    // Delete all messages in the thread
    await prisma.message.deleteMany({
      where: {
        userId: session.user.id,
        threadId: threadId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat thread' },
      { status: 500 }
    );
  }
}