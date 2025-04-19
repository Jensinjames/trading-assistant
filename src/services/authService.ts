import { generateToken, verifyToken } from '@/lib/jwt';
import { AuthUser, AuthResponse, AuthError } from '@/types/auth';
import { hash, compare } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Prisma client
const prisma = new PrismaClient();

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export class AuthService {
  static async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw { message: 'Email already registered', code: 'EMAIL_EXISTS' };
      }

      // Validate password strength
      try {
        passwordSchema.parse(password);
      } catch (error: any) {
        throw { 
          message: 'Password does not meet security requirements', 
          code: 'WEAK_PASSWORD',
          details: error.errors 
        };
      }

      // Hash password with a strong salt
      const hashedPassword = await hash(password, 12);

      // Create user with default role
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        include: {
          settings: true,
        },
      });

      // Generate token with appropriate claims
      const token = await generateToken({
        userId: user.id,
        email: user.email!,
        role: 'user', // Default role for new users
      });

      return {
        user: {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role: 'user', // Default role since role field doesn't exist on User model
          settings: {
            openaiApiKey: user.settings?.openaiApiKey || undefined,
            openaiOrganization: user.settings?.openaiOrganization || undefined,
            openaiProjectId: user.settings?.openaiProjectId || undefined,
            openaiModel: user.settings?.openaiModel || 'gpt-3.5-turbo',
            tradingViewApiKey: user.settings?.tradingViewApiKey || undefined, 
            telegramBotToken: user.settings?.telegramBotToken || undefined
          },
        },
        token,
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to create account',
        code: error.code || 'SIGNUP_ERROR',
        details: error.details,
      };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          settings: true,
        },
      });

      if (!user || !user.password) {
        throw { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      }

      // Verify password with timing attack protection
      const isValid = await compare(password, user.password);
      if (!isValid) {
        throw { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      }

      // Generate token with appropriate claims
      const token = await generateToken({
        userId: user.id,
        email: user.email!,
        role: 'user', // Default role since role field doesn't exist on User model
      });

      return {
        user: {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role: 'user', // Default role since role field doesn't exist on User model
          settings: {
            openaiApiKey: user.settings?.openaiApiKey || undefined,
            openaiOrganization: user.settings?.openaiOrganization || undefined,
            openaiProjectId: user.settings?.openaiProjectId || undefined,
            openaiModel: user.settings?.openaiModel || 'gpt-3.5-turbo',
            tradingViewApiKey: user.settings?.tradingViewApiKey || undefined,
            telegramBotToken: user.settings?.telegramBotToken || undefined
          },
        },
        token,
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to log in',
        code: error.code || 'LOGIN_ERROR',
      };
    }
  }

  static async validateToken(token: string): Promise<AuthUser> {
    try {
      const decoded = await verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          settings: true,
        },
      });

      if (!user) {
        throw { message: 'User not found', code: 'USER_NOT_FOUND' };
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.name ?? '',
        role: 'user', // Default to user role since role field doesn't exist
        settings: user.settings ? {
          openaiApiKey: user.settings.openaiApiKey ?? undefined,
          openaiOrganization: user.settings.openaiOrganization ?? undefined,
          openaiProjectId: user.settings.openaiProjectId ?? undefined,
          openaiModel: user.settings.openaiModel ?? 'gpt-3.5-turbo',
          tradingViewApiKey: user.settings.tradingViewApiKey ?? undefined, 
          telegramBotToken: user.settings.telegramBotToken ?? undefined
        } : undefined,
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Invalid token',
        code: error.code || 'INVALID_TOKEN',
      };
    }
  }
} 