import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  settings?: {
    openaiApiKey?: string;
    openaiOrganization?: string;
    openaiProjectId?: string;
    openaiModel?: string;
    tradingViewApiKey?: string;
    telegramBotToken?: string;
  };
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthError {
  message: string;
  code?: string;
} 