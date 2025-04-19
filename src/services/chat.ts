import { prisma } from '@/server/db';
import { OpenAIService } from './openai';
import { Message, UserSettings } from '@prisma/client';

export class ChatService {
  private openai: OpenAIService;

  constructor(settings: UserSettings) {
    this.openai = OpenAIService.initialize(settings);
  }

  public async processMessage(userId: string, content: string, threadId: string): Promise<Message> {
    try {
      // Check content moderation
      const isFlagged = await this.openai.moderateContent(content, userId);
      if (isFlagged) {
        throw new Error('Content flagged as inappropriate');
      }

      // Save user message
      const userMessage = await this.saveMessage(userId, threadId, 'user', content);

      // Get conversation history
      const history = await this.getConversationHistory(threadId);
      const messages = history.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      // Add system message if it's the start of conversation
      if (messages.length === 0) {
        messages.unshift({
          role: 'system',
          content: 'You are a helpful trading assistant. You help users analyze markets, understand trading concepts, and make informed decisions. You do not provide specific financial advice or recommendations.',
        });
      }

      // Get AI response with streaming disabled
      const completion = await this.openai.createChatCompletion(
        messages,
        userId,
        {
          temperature: 0.7,
          maxTokens: 1000,
          stream: false,
        }
      );

      const aiResponse = completion.choices[0].message;

      // Save AI response
      const assistantMessage = await this.saveMessage(
        userId,
        threadId,
        aiResponse.role,
        aiResponse.content || ''
      );

      // Log the interaction
      await this.logChat(userId, content, aiResponse.content || '', completion.model);

      return assistantMessage;
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Save the error message for the user
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your message';
      await this.saveMessage(
        userId,
        threadId,
        'assistant',
        `I apologize, but I encountered an error: ${errorMessage}`
      );

      throw error;
    }
  }

  private async saveMessage(
    userId: string,
    threadId: string,
    role: string,
    content: string
  ): Promise<Message> {
    try {
      return await prisma.message.create({
        data: {
          userId,
          threadId,
          role,
          content,
        },
      });
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  private async getConversationHistory(threadId: string): Promise<Message[]> {
    try {
      return await prisma.message.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
        take: 10, // Limit conversation history
      });
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw new Error('Failed to fetch conversation history');
    }
  }

  private async logChat(
    userId: string,
    input: string,
    output: string,
    model: string
  ): Promise<void> {
    try {
      await prisma.chatLog.create({
        data: {
          userId,
          input,
          output,
          model,
        },
      });
    } catch (error) {
      console.error('Error logging chat:', error);
      // Don't throw error for logging failures
    }
  }

  public updateSettings(settings: Partial<UserSettings>): void {
    this.openai.updateConfig(settings);
  }
}