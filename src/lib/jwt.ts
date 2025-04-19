import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);
const TOKEN_EXPIRY = '24h';

export interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function decodeToken(token: string): Promise<JWTPayload | null> {
  try {
    return jose.decodeJwt(token) as JWTPayload;
  } catch {
    return null;
  }
} 