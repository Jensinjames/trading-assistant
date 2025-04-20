import { prisma } from '@/server/db';
import { OpenAIService } from '../ai/openai';
import { OllamaService } from '../ai/ollama';
import type { ChatMessage } from '@/types/assistant';
import type { Settings } from '@/types/settings';
import { IChatService } from '@/types/services';

interface AIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
    };
  }>;
  model: string;
}

type AIServiceType = OpenAIService | OllamaService;

export class ChatService implements IChatService {
  private aiService: AIServiceType;

  constructor(settings: Settings) {
    if (!settings.aiProvider) {
      throw new Error('AI provider must be specified in settings');
    }
    this.aiService = this.initializeAIService(settings);
  }

  private initializeAIService(settings: Settings): AIServiceType {
    switch (settings.aiProvider) {
      case 'ollama':
        if (!settings.ollamaModel) {
          console.warn('No Ollama model specified, using default granite3.2-vision');
        }
        return OllamaService.initialize(settings);
      case 'openai':
        if (!settings.openaiApiKey) {
          throw new Error('OpenAI API key is required when using OpenAI provider');
        }
        return OpenAIService.initialize(settings);
      default:
        throw new Error(`Unsupported AI provider: ${settings.aiProvider}`);
    }
  }

  public async processMessage(userId: string, content: string, threadId: string): Promise<ChatMessage> {
    try {
      // Check content moderation
      const isFlagged = await this.aiService.moderateContent(content, userId);
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

      try {
        // Get AI response
        const completion = await this.aiService.createChatCompletion(
          messages,
          userId,
          {
            temperature: 0.7,
            maxTokens: 1000,
            stream: false,
          }
        ) as AIResponse;

        if (!completion.choices?.[0]?.message) {
          throw new Error('Invalid response format from AI service');
        }

        const aiResponse = completion.choices[0].message;
        const responseContent = aiResponse.content || '';

        if (!responseContent) {
          throw new Error('Empty response from AI service');
        }

        // Save AI response
        const assistantMessage = await this.saveMessage(
          userId,
          threadId,
          aiResponse.role as 'assistant',
          responseContent
        );

        // Log the interaction
        await this.logChat(userId, content, responseContent, completion.model);

        return assistantMessage;
      } catch (error: any) {
        // Handle API errors with provider-specific context
        let errorMessage = 'An error occurred while processing your message';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          if (error.message.includes('API key')) {
            errorMessage = 'There was an issue with the AI service authentication. Please check your settings.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'The AI service took too long to respond. Please try again.';
          }
        }

        const assistantMessage = await this.saveMessage(
          userId,
          threadId,
          'assistant',
          `I apologize, but I encountered an error: ${errorMessage}`
        );
        throw error;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private async saveMessage(
    userId: string,
    threadId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<ChatMessage> {
    try {
      const data = {
        user: { connect: { id: userId } },
        thread: { connect: { id: threadId } },
        role,
        content,
        category: 'general'
      };

      const message = await prisma.message.create({ 
        data,
        include: {
          user: true,
          thread: true,
          reactions: true
        }
      });

      // Update thread's updatedAt timestamp
      await prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() }
      });

      return {
        id: message.id,
        userId: message.userId,
        threadId: message.threadId,
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content,
        createdAt: message.createdAt,
        category: message.category as 'general' | 'analysis' | 'advice' | 'alert',
        reactions: message.reactions,
        updatedAt: message.updatedAt
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  private async getConversationHistory(threadId: string): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          thread: { id: threadId },
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Limit conversation history
      });

      return messages.map((msg: { id: string; userId: string; threadId: string; role: string; content: string; createdAt: Date; category: string; updatedAt: Date }) => ({
        id: msg.id,
        userId: msg.userId,
        threadId: msg.threadId,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        createdAt: msg.createdAt,
        category: msg.category as 'general' | 'analysis' | 'advice' | 'alert',
        reactions: [],
        updatedAt: msg.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw new Error('Failed to fetch conversation history');
    }
  }

  private async logChat(
    userId: string,
    input: string,
    output: string,
    model: string,
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

  public updateSettings(settings: Partial<Settings> & { aiProvider?: 'openai' | 'ollama' }): void {
    if (settings.aiProvider) {
      // Create a complete settings object by merging with existing settings
      const fullSettings: Settings = {
        ...settings,
        aiProvider: settings.aiProvider
      } as Settings;

      try {
        // Reinitialize AI service if provider changed
        this.aiService = this.initializeAIService(fullSettings);
      } catch (error) {
        console.error('Failed to update AI service:', error);
        throw new Error('Failed to update AI service settings');
      }
    } else {
      this.aiService.updateConfig(settings);
    }
  }
} 