import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

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
    
    const messages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
        id: threadId,
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

    const thread = {
      id: threadId,
      title: messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
      messages,
      createdAt: messages[0].createdAt.getTime(),
      updatedAt: messages[messages.length - 1].createdAt.getTime(),
    };
    
    return NextResponse.json(thread);
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
    
    await prisma.message.deleteMany({
      where: {
        userId: session.user.id,
        id: threadId,
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