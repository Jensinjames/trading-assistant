import { prisma } from '@/server/db';
import { generateId } from '@/utils/id';
import type { Prisma } from '@prisma/client';

export interface Message {
  id: string;
  userId: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get or create the default trading assistant
 */
async function getDefaultAssistant() {
  const defaultAssistant = await prisma.assistant.findFirst({
    where: { name: 'Trading Assistant' }
  });

  if (defaultAssistant) {
    return defaultAssistant;
  }

  return prisma.assistant.create({
    data: {
      name: 'Trading Assistant',
      description: 'Default trading assistant that helps with cryptocurrency trading.',
      systemPrompt: 'You are a helpful trading assistant that provides guidance and analysis for cryptocurrency trading.',
      model: 'gpt-3.5-turbo'
    }
  });
}

/**
 * Create a new chat thread
 */
export async function createChatThread(userId: string, initialMessage?: string): Promise<ChatThread> {
  const threadId = generateId();
  const now = new Date();
  
  // Get or create the default assistant
  const assistant = await getDefaultAssistant();
  
  const messages = [
    {
      id: generateId(),
      userId,
      threadId,
      role: 'assistant',
      content: "Hello! I'm your trading assistant. How can I help you with your cryptocurrency trading today?",
      createdAt: now
    }
  ];

  if (initialMessage) {
    messages.push({
      id: generateId(),
      userId,
      threadId,
      role: 'user',
      content: initialMessage,
      createdAt: now
    });
  }

  // Save the thread to the database
  const data: Prisma.ChatThreadCreateInput = {
    id: threadId,
    user: { connect: { id: userId } },
    assistant: { connect: { id: assistant.id } },
    title: initialMessage?.slice(0, 30) || 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: {
      create: messages.map(msg => ({
        id: msg.id,
        user: { connect: { id: userId } },
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      }))
    }
  };

  try {
    const thread = await prisma.chatThread.create({
      data,
      include: {
        messages: true
      }
    });

    return {
      id: thread.id,
      userId: thread.userId,
      title: thread.title,
      messages: thread.messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        threadId: msg.threadId,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        createdAt: msg.createdAt
      })),
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    };
  } catch (error) {
    console.error('Error creating chat thread:', error);
    throw error;
  }
}