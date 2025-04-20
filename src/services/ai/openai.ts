import OpenAI from 'openai';
import { IAIService } from '@/types/services';
import type { Settings } from '@/types/settings';

interface QuotaError extends Error {
  status: number;
  code: string;
  type: string;
}

export class OpenAIService implements IAIService {
  private client: OpenAI;
  private settings: Settings;
  private fallbackApiKey: string | undefined;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 2;
  private readonly QUOTA_ERRORS = ['insufficient_quota', 'rate_limit_exceeded'];

  private constructor(settings: Settings) {
    this.settings = settings;
    this.fallbackApiKey = process.env.OPENAI_API_KEY;
    this.client = new OpenAI({
      apiKey: settings.openaiApiKey || this.fallbackApiKey,
      organization: settings.openaiOrganization,
    });
  }

  static initialize(settings: Settings): OpenAIService {
    return new OpenAIService(settings);
  }

  private isQuotaError(error: any): error is QuotaError {
    return (
      error?.status === 429 ||
      this.QUOTA_ERRORS.includes(error?.error?.type) ||
      error?.message?.toLowerCase().includes('quota')
    );
  }

  private async withQuotaHandling<T>(operation: () => Promise<T>, fallback: T | null = null): Promise<T> {
    try {
      const result = await operation();
      // Reset retry count on successful operation
      this.retryCount = 0;
      return result;
    } catch (error: any) {
      console.error('OpenAI API Error:', {
        status: error?.status,
        type: error?.error?.type,
        message: error?.message
      });

      if (this.isQuotaError(error)) {
        if (this.retryCount >= this.MAX_RETRIES) {
          throw new Error(
            'API rate limit exceeded. Please try again later or check your API key settings.'
          );
        }

        this.retryCount++;

        if (this.settings.openaiApiKey && this.fallbackApiKey) {
          console.log(`Attempting fallback to default API key (Attempt ${this.retryCount})`);
          const originalKey = this.client.apiKey;
          this.client = new OpenAI({ 
            apiKey: this.fallbackApiKey,
            organization: process.env.OPENAI_ORGANIZATION 
          });
          
          try {
            const result = await operation();
            return result;
          } catch (fallbackError) {
            if (this.isQuotaError(fallbackError)) {
              throw new Error(
                'API quota exceeded for both user and fallback keys. Please try again later.'
              );
            }
            throw fallbackError;
          } finally {
            // Restore original configuration
            this.client = new OpenAI({ 
              apiKey: originalKey,
              organization: this.settings.openaiOrganization 
            });
          }
        }

        throw new Error(
          'API quota exceeded. Please check your API key settings or try again later.'
        );
      }

      // For non-quota errors, return fallback if provided
      if (fallback !== null) {
        return fallback;
      }

      // Enhance error message for other types of errors
      const errorMessage = error?.error?.message || error?.message || 'An unknown error occurred';
      throw new Error(`OpenAI API Error: ${errorMessage}`);
    }
  }

  public async moderateContent(content: string, userId: string): Promise<boolean> {
    return this.withQuotaHandling(
      async () => {
        const response = await this.client.moderations.create({
          input: content,
        });
        return response.results[0].flagged;
      },
      false // Default to allowing content if all attempts fail
    );
  }

  public async createChatCompletion(
    messages: any[],
    userId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ) {
    return this.withQuotaHandling(async () => {
      const completion = await this.client.chat.completions.create({
        model: this.settings.openaiModel || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: options.stream ?? false,
      });

      return completion;
    });
  }

  public updateConfig(settings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...settings };
    this.client = new OpenAI({
      apiKey: this.settings.openaiApiKey || this.fallbackApiKey,
      organization: this.settings.openaiOrganization,
    });
  }
}