import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import type { Assistant, ChatThread, ChatMessage, AssistantRole, MessageCategory } from '@/types/assistant';

export class AssistantService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createAssistant(data: {
    name: string;
    description?: string | null;
    model?: string;
    systemPrompt: string;
  }): Promise<Assistant> {
    const assistant = await this.prisma.assistant.create({
      data: {
        ...data,
        model: data.model || 'gpt-3.5-turbo',
      },
    });

    return {
      ...assistant,
      description: assistant.description || undefined,
    };
  }

  async createThread(userId: string, assistantId: string, title: string): Promise<ChatThread> {
    const thread = await this.prisma.chatThread.create({
      data: {
        userId,
        assistantId,
        title,
      },
      include: {
        messages: {
          include: {
            reactions: true
          }
        }
      }
    });

    return {
      ...thread,
      messages: thread.messages.map(msg => ({
        ...msg,
        reactions: msg.reactions || [],
        role: msg.role as AssistantRole,
        category: (msg.category || 'general') as MessageCategory,
        assistantId: msg.assistantId || undefined,
      }))
    };
  }

  async sendMessage(threadId: string, content: string): Promise<ChatMessage> {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          include: {
            reactions: true
          }
        },
        assistant: true
      }
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    // Get previous messages
    const messages = thread.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    // Add new message
    messages.push({
      role: 'user',
      content
    });

    // Get completion from OpenAI
    const completion = await this.openai.chat.completions.create({
      model: thread.assistant.model,
      messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    });

    // Save assistant response
    const response = completion.choices[0].message;
    const message = await this.prisma.message.create({
      data: {
        threadId,
        userId: thread.userId,
        assistantId: thread.assistantId,
        role: response.role,
        content: response.content || '',
        category: 'general'
      },
      include: {
        reactions: true
      }
    });

    return {
      ...message,
      reactions: message.reactions || [],
      role: message.role as AssistantRole,
      category: (message.category || 'general') as MessageCategory,
      assistantId: message.assistantId || undefined,
    };
  }
}