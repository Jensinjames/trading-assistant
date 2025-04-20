import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Ollama connection
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const ollamaResponse = await fetch(`${ollamaHost}/api/health`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!ollamaResponse.ok) {
      return NextResponse.json({
        status: 'degraded',
        database: 'available',
        ollama: 'unavailable',
        message: 'Ollama service is not responding'
      }, { status: 503 });
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'available',
      ollama: 'available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const response: any = {
      status: 'error',
      database: 'unknown',
      ollama: 'unknown',
      timestamp: new Date().toISOString()
    };

    if (error instanceof Error) {
      response.message = error.message;
      // Check if it's a database error
      if (error.message.includes('database') || error.message.includes('prisma')) {
        response.database = 'unavailable';
        response.ollama = 'unknown';
      }
      // Check if it's an Ollama error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        response.database = 'available';
        response.ollama = 'unavailable';
      }
    }

    return NextResponse.json(response, { status: 500 });
  }
} 