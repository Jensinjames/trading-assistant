import { z } from 'zod';
import type { Settings } from './settings';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  settings?: Settings;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthError {
  message: string;
  code: string;
  details?: any;
}

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;