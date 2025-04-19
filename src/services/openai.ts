import OpenAI from 'openai';
import { UserSettings } from '@prisma/client';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  projectId?: string;
  model: string;
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;
  private static instance: OpenAIService;
  private ratelimit: Ratelimit | null = null;

  private constructor(settings: UserSettings) {
    if (!settings.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.config = {
      apiKey: settings.openaiApiKey,
      organization: settings.openaiOrganization || undefined,
      projectId: settings.openaiProjectId || undefined,
      model: settings.openaiModel || 'gpt-3.5-turbo',
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      organization: this.config.organization,
      project: this.config.projectId,
    });

    // Initialize rate limiter if Redis is configured
    try {
      const redis = Redis.fromEnv();
      this.ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(50, '1m'), // 50 requests per minute
        analytics: true,
        prefix: 'openai_ratelimit',
      });
    } catch (error) {
      console.warn('Redis not configured. Rate limiting disabled.');
    }
  }

  public static initialize(settings: UserSettings): OpenAIService {
    OpenAIService.instance = new OpenAIService(settings);
    return OpenAIService.instance;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      throw new Error('OpenAI service not initialized');
    }
    return OpenAIService.instance;
  }

  private async checkRateLimit(userId: string): Promise<void> {
    if (this.ratelimit) {
      const { success, reset, remaining } = await this.ratelimit.limit(userId);
      if (!success) {
        throw new Error(`Rate limit exceeded. Reset at ${new Date(reset).toISOString()}. Remaining: ${remaining}`);
      }
    }
  }

  public async moderateContent(content: string, userId?: string): Promise<boolean> {
    try {
      if (userId) {
        await this.checkRateLimit(userId);
      }

      const response = await this.client.moderations.create({
        input: content,
      });

      return response.results[0]?.flagged || false;
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      throw this.handleOpenAIError(error);
    }
  }

  public async createChatCompletion(
    messages: { role: string; content: string }[],
    userId?: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ) {
    try {
      if (userId) {
        await this.checkRateLimit(userId);
      }

      return await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: options.stream ?? false,
      });
    } catch (error) {
      console.error('OpenAI chat completion error:', error);
      throw this.handleOpenAIError(error);
    }
  }

  private handleOpenAIError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          return new Error('Invalid API key. Please check your OpenAI API key in settings.');
        case 429:
          return new Error('Rate limit exceeded or insufficient quota. Please check your OpenAI account.');
        case 500:
          return new Error('OpenAI service error. Please try again later.');
        default:
          return new Error(`OpenAI API error: ${error.message}`);
      }
    }
    return error;
  }

  public updateConfig(settings: Partial<UserSettings>): void {
    if (settings.openaiApiKey) {
      this.config.apiKey = settings.openaiApiKey;
    }
    if (settings.openaiOrganization !== undefined) {
      this.config.organization = settings.openaiOrganization;
    }
    if (settings.openaiProjectId !== undefined) {
      this.config.projectId = settings.openaiProjectId;
    }
    if (settings.openaiModel) {
      this.config.model = settings.openaiModel;
    }

    // Reinitialize the OpenAI client with new settings
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      organization: this.config.organization,
      project: this.config.projectId,
    });
  }
}