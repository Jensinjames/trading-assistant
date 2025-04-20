import jwt from 'jsonwebtoken'
import { AuthUser } from '@/types/auth'

// Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable must be set')
}

export interface JWTPayload {
  id: string
  email: string
  name?: string | null
  role: string
}

export interface JWTError {
  message: string
  code: 'token_expired' | 'token_invalid' | 'token_not_provided'
}

export type JWTVerifyResult = {
  success: true
  data: JWTPayload
} | {
  success: false
  error: JWTError
}

export const signJwtToken = (user: AuthUser): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user'
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  })
}

export const verifyJwtToken = async (token?: string | null): Promise<JWTVerifyResult> => {
  if (!token) {
    return {
      success: false,
      error: {
        message: 'No token provided',
        code: 'token_not_provided'
      }
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return {
      success: true,
      data: decoded
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: {
          message: 'Token has expired',
          code: 'token_expired'
        }
      }
    }
    return {
      success: false,
      error: {
        message: 'Invalid token',
        code: 'token_invalid'
      }
    }
  }
}