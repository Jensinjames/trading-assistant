import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

interface UserSettings {
  openaiApiKey: string | null;
  openaiOrganization: string | null;
  openaiProjectId: string | null;
  openaiModel: string | null;
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

    const { messages, image } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // If an image is provided, add it to the last user message
    if (image) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content = [
          { type: 'text', text: lastMessage.content },
          {
            type: 'image_url',
            image_url: {
              url: image,
              detail: 'high'
            }
          }
        ];
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
      max_tokens: 500,
    });

    const reply = response.choices[0].message;

    return NextResponse.json({
      role: reply.role,
      content: reply.content,
    });
  } catch (error: any) {
    console.error('Error in chat vision API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 