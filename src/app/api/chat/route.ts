import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createChatThread } from '@/lib/messageStorage';
import { ChatService } from '@/services/communication/chat';
import { Settings } from '@/types/settings';

let ratelimit: Ratelimit | null = null;
try {
  const redis = Redis.fromEnv();
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1m'),
    analytics: true,
  });
} catch (error) {
  console.warn('Redis configuration not found. Rate limiting disabled.');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting if configured
    if (ratelimit) {
      const { success, reset } = await ratelimit.limit(session.user.id);
      if (!success) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            resetAt: reset
          },
          { status: 429 }
        );
      }
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

    const { message, threadId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create a new thread if none is provided
    let actualThreadId = threadId;
    if (!threadId) {
      const newThread = await createChatThread(session.user.id, message);
      actualThreadId = newThread.id;
    }

    // Ensure all required settings are present and non-null
    if (!userSettings.openaiModel || !userSettings.openaiApiKey) {
      return NextResponse.json(
        { error: 'Required OpenAI settings are missing' },
        { status: 400 }
      );
    }

    const chatService = new ChatService({
      ...userSettings,
      aiProvider: 'openai'  // Default to OpenAI since we're checking for OpenAI settings
    } as Settings);
    const response = await chatService.processMessage(session.user.id, message, actualThreadId);

    return NextResponse.json({
      role: response.role,
      content: response.content,
      threadId: actualThreadId,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}