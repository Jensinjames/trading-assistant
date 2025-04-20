import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { threadId, content, role = 'user' } = body;

  if (!threadId || !content) {
    return NextResponse.json({ error: 'Thread ID and content are required' }, { status: 400 });
  }

  // Verify the thread belongs to the user
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { userId: true }
  });

  if (!thread || thread.userId !== session.user.id) {
    return NextResponse.json({ error: 'Thread not found or unauthorized' }, { status: 404 });
  }

  const messageData: Prisma.MessageCreateInput = {
    content,
    role,
    user: { connect: { id: session.user.id } },
    thread: { connect: { id: threadId } }
  };

  const message = await prisma.message.create({
    data: messageData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Update thread's updatedAt
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() }
  });

  return NextResponse.json(message);
} 