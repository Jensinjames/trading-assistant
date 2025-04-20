import { AuthService } from './auth';
import { ChatService } from './communication/chat';
import { OpenAIService } from './ai/openai';
import type { Settings } from '@/types/settings';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private authService: AuthService;
  private chatService: ChatService;

  private constructor() {
    this.authService = new AuthService();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public getAuthService(): AuthService {
    return this.authService;
  }

  public getChatService(settings: Settings): ChatService {
    if (!this.chatService) {
      this.chatService = new ChatService(settings);
    }
    return this.chatService;
  }

  public updateChatService(settings: Settings): void {
    if (this.chatService) {
      this.chatService.updateSettings(settings);
    }
  }
}