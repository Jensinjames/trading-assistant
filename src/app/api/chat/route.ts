import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/server/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface UserSettings {
  openaiApiKey: string | null;
  openaiOrganization: string | null;
  openaiProjectId: string | null;
  openaiModel: string | null;
}

// Create a new ratelimiter instance
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1m'), // 10 requests per minute
  analytics: true,
});

// Constants for token limits
const MAX_INPUT_TOKENS = 4000;
const MAX_OUTPUT_TOKENS = 1000;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
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

    // Get user settings
    const userSettings = (await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    })) as UserSettings | null;

    if (!userSettings?.openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set it in your settings.' },
        { status: 400 }
      );
    }

    // Create OpenAI client with user's API key
    const openai = new OpenAI({
      apiKey: userSettings.openaiApiKey,
      organization: userSettings.openaiOrganization ?? undefined,
      project: userSettings.openaiProjectId ?? undefined,
    });

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Calculate total input tokens (rough estimate)
    const totalInputTokens = messages.reduce((acc, msg) => 
      acc + (msg.content?.length || 0) / 4, 0);

    if (totalInputTokens > MAX_INPUT_TOKENS) {
      return NextResponse.json(
        { error: 'Input text too long' },
        { status: 400 }
      );
    }

    // Check content moderation
    const lastMessage = messages[messages.length - 1];
    const moderationResponse = await openai.moderations.create({
      input: lastMessage.content,
    });

    if (moderationResponse.results[0]?.flagged) {
      return NextResponse.json(
        { error: 'Content flagged as inappropriate' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: userSettings.openaiModel ?? 'gpt-3.5-turbo',
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
    });

    const reply = response.choices[0].message;

    // Log the interaction for monitoring
    await prisma.chatLog.create({
      data: {
        userId: session.user.id,
        input: lastMessage.content,
        output: reply.content || '',
        model: userSettings.openaiModel || 'gpt-3.5-turbo',
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      role: reply.role,
      content: reply.content,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 