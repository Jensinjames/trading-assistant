import { IAIService } from '@/types/services';
import type { Settings } from '@/types/settings';

interface OllamaResponse {
  response: string;
  context: number[];
  model: string;
  created_at: string;
  done: boolean;
}

export class OllamaService implements IAIService {
  private baseUrl: string;
  private model: string;

  private constructor(settings: Settings) {
    this.baseUrl = 'http://localhost:11434/api';  // Default Ollama API endpoint
    this.model = 'granite3.2-vision';  // Using granite3.2-vision as default
  }

  static initialize(settings: Settings): OllamaService {
    return new OllamaService(settings);
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  public async moderateContent(content: string, userId: string): Promise<boolean> {
    // Ollama doesn't have a built-in moderation API, so we'll implement a basic check
    const inappropriateTerms = [
      'hack', 'exploit', 'crack', 'steal', 'illegal', 'fraud'
    ];
    return inappropriateTerms.some(term => content.toLowerCase().includes(term));
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
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            options: {
              temperature: options.temperature ?? 0.7,
              num_predict: options.maxTokens,
            },
            stream: options.stream ?? false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: data.response
          }
        }],
        model: data.model,
      };
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from Ollama');
    }
  }

  public updateConfig(settings: Partial<Settings>): void {
    if (settings.ollamaEndpoint) {
      this.baseUrl = settings.ollamaEndpoint;
    }
    if (settings.ollamaModel) {
      this.model = settings.ollamaModel;
    }
  }
}