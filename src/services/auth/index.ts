import { signJwtToken, verifyJwtToken } from '@/lib/jwt';
import { AuthUser, AuthResponse, Role } from '@/types/auth';
import { IAuthService } from '@/types/services';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';
import type { Settings } from '@/types/settings';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const DEFAULT_ROLE: Role = 'user';

const mapUserSettings = (settings: any): Settings => ({
  openaiApiKey: settings?.openaiApiKey ?? null,
  openaiOrganization: settings?.openaiOrganization ?? null,
  openaiProjectId: settings?.openaiProjectId ?? null,
  openaiModel: settings?.openaiModel ?? 'gpt-3.5-turbo',
  tradingViewApiKey: settings?.tradingViewApiKey ?? null,
  telegramBotToken: settings?.telegramBotToken ?? null,
  aiProvider: settings?.aiProvider ?? 'openai',
});

export class AuthService implements IAuthService {
  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
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
          role: DEFAULT_ROLE,
        },
        include: {
          settings: true,
        },
      });

      // Generate token
      const token = signJwtToken({
        id: user.id,
        email: user.email!,
        name: user.name!,
        role: DEFAULT_ROLE,
      });

      return {
        user: {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role: DEFAULT_ROLE,
          settings: user.settings ? mapUserSettings(user.settings) : undefined,
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

  async login(email: string, password: string): Promise<AuthResponse> {
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

      // Verify password
      const isValid = await compare(password, user.password);
      if (!isValid) {
        throw { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      }

      const role = (user.role === 'admin' ? 'admin' : 'user') as Role;

      // Generate token
      const token = signJwtToken({
        id: user.id,
        email: user.email!,
        name: user.name!,
        role,
      });

      return {
        user: {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role,
          settings: user.settings ? mapUserSettings(user.settings) : undefined,
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

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const result = await verifyJwtToken(token);
      
      if (!result.success) {
        throw { message: result.error.message, code: result.error.code };
      }
      
      const user = await prisma.user.findUnique({
        where: { id: result.data.id },
        include: {
          settings: true,
        },
      });

      if (!user) {
        throw { message: 'User not found', code: 'USER_NOT_FOUND' };
      }

      const role = (user.role === 'admin' ? 'admin' : 'user') as Role;

      return {
        id: user.id,
        email: user.email!,
        name: user.name ?? '',
        role,
        settings: user.settings ? mapUserSettings(user.settings) : undefined,
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Invalid token',
        code: error.code || 'INVALID_TOKEN',
      };
    }
  }
}