import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import type { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emoji } = await request.json();
    const { messageId } = params;

    // Validate emoji
    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json(
        { error: 'Invalid emoji provided' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction([
      // Check if message exists and user has access to it
      prisma.message.findFirst({
        where: {
          id: messageId,
          thread: {
            userId: session.user.id,
          },
        },
      }),

      // Find existing reaction
      prisma.reaction.findFirst({
        where: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      }),
    ]);

    const [message, existingReaction] = result;

    if (!message) {
      throw new Error('Message not found or access denied');
    }

    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      await prisma.reaction.create({
        data: {
          emoji,
          userId: session.user.id,
          messageId,
        },
      });
    }

    // Get updated reactions
    const updatedReactions = await prisma.reaction.findMany({
      where: { messageId },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ reactions: updatedReactions });
  } catch (error) {
    console.error('Error handling reaction:', error);
    if (error instanceof Error && error.message === 'Message not found or access denied') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
} 