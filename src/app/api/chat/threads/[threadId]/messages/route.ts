import { NextResponse } from 'next/server';
import { 
  getChatThread, 
  addMessageToThread 
} from '@/lib/messageStorage';
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
    const thread = getChatThread(session.user.id, threadId);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(thread.messages);
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

    const { threadId } = params;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const thread = getChatThread(session.user.id, threadId);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }

    // Add the user's message to the thread
    addMessageToThread(session.user.id, threadId, 'user', message);

    // Get AI response
    const response = await openai.chat.completions.create({
      model: userSettings.openaiModel ?? 'gpt-3.5-turbo',
      messages: [
        ...thread.messages,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiMessage = response.choices[0].message;

    // Add the AI's response to the thread
    addMessageToThread(session.user.id, threadId, aiMessage.role, aiMessage.content || '');

    return NextResponse.json({
      role: aiMessage.role,
      content: aiMessage.content,
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 