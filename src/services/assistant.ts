import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { Assistant, ChatMessage, ChatThread } from '@/types/assistant';

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
    description?: string;
    model?: string;
    systemPrompt: string;
  }): Promise<Assistant> {
    return this.prisma.assistant.create({
      data: {
        ...data,
        model: data.model || 'gpt-3.5-turbo',
      },
    });
  }

  async createThread(userId: string, assistantId: string, title: string): Promise<ChatThread> {
    return this.prisma.chatThread.create({
      data: {
        userId,
        assistantId,
        title,
      },
      include: {
        messages: true,
      },
    });
  }

  async sendMessage(threadId: string, content: string): Promise<ChatMessage> {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: true,
        assistant: true,
      },
    });

    if (!thread) throw new Error('Thread not found');

    // Create user message
    const userMessage = await this.prisma.message.create({
      data: {
        threadId,
        userId: thread.userId,
        content,
        role: 'user',
      },
    });

    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: thread.assistant.systemPrompt },
      ...thread.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user', content },
    ];

    // Get assistant response
    const completion = await this.openai.chat.completions.create({
      model: thread.assistant.model,
      messages,
    });

    // Save assistant response
    const assistantMessage = await this.prisma.message.create({
      data: {
        threadId,
        userId: thread.userId,
        assistantId: thread.assistantId,
        content: completion.choices[0].message?.content || '',
        role: 'assistant',
      },
    });

    return assistantMessage;
  }
}