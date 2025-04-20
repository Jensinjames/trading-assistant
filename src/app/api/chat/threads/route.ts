import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import { createChatThread } from '@/lib/messageStorage';

// GET /api/chat/threads - Get all threads for the user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const threads = await prisma.$queryRaw`
    SELECT ct.*, json_agg(m.* ORDER BY m."createdAt" ASC) as messages
    FROM "ChatThread" ct
    LEFT JOIN "Message" m ON m."threadId" = ct.id
    WHERE ct."userId" = ${session.user.id}
    GROUP BY ct.id
    ORDER BY ct."updatedAt" DESC
  `;

  return NextResponse.json(threads);
}

// POST /api/chat/threads - Create a new thread
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { message = '' } = body;

  const thread = await createChatThread(session.user.id, message);
  return NextResponse.json(thread);
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
    
    // Delete the thread (messages will be deleted automatically due to onDelete: Cascade)
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