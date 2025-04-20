import { AuthUser, AuthResponse } from './auth';
import { Settings } from './settings';
import { Message } from '@/lib/messageStorage';

export interface IAuthService {
  signUp(email: string, password: string, name: string): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
  validateToken(token: string): Promise<AuthUser>;
}

export interface IChatService {
  processMessage(userId: string, content: string, threadId: string): Promise<Message>;
  updateSettings(settings: Partial<Settings>): void;
}

export interface IAIService {
  moderateContent(content: string, userId: string): Promise<boolean>;
  createChatCompletion(messages: any[], userId: string, options: any): Promise<any>;
  updateConfig(settings: Partial<Settings>): void;
}

export interface IMarketService {
  getMarketData(): Promise<any>;
  getNewListings(): Promise<any>;
  getNewsData(): Promise<any>;
}