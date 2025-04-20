import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

type MessageResponse = {
  id: string;
  userId: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
};

// GET /api/chat/threads/[threadId] - Get a specific thread
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
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    const thread = await prisma.$queryRaw`
      SELECT ct.*, json_agg(m.* ORDER BY m."createdAt" ASC) as messages
      FROM "ChatThread" ct
      LEFT JOIN "Message" m ON m."threadId" = ct.id
      WHERE ct.id = ${threadId}
      AND ct."userId" = ${session.user.id}
      GROUP BY ct.id
    `;

    if (!thread || !Array.isArray(thread) || thread.length === 0) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }

    const threadData = thread[0];
    const messages = threadData.messages || [];
    
    return NextResponse.json({
      id: threadData.id,
      title: threadData.title,
      messages: messages.map((msg: any): MessageResponse => ({
        id: msg.id,
        userId: msg.userId,
        threadId: msg.threadId,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      })),
      createdAt: new Date(threadData.createdAt).getTime(),
      updatedAt: new Date(threadData.updatedAt).getTime(),
    });
  } catch (error) {
    console.error('Error fetching chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/threads/[threadId] - Delete a thread
export async function DELETE(
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
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    await prisma.$executeRaw`
      DELETE FROM "ChatThread"
      WHERE id = ${threadId}
      AND "userId" = ${session.user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat thread' },
      { status: 500 }
    );
  }
} 