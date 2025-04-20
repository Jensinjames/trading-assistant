import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createThread, initializeTradingAssistant } from '@/lib/trading-assistant';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please sign in.',
      }, { status: 401 });
    }

    // Test 1: Initialize Trading Assistant and create a new thread
    console.log('Test 1: Initializing Trading Assistant and creating a thread...');
    
    // Get user settings to access OpenAI API key
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings?.openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not found in user settings' },
        { status: 400 }
      );
    }
    
    // Initialize the Trading Assistant
    await initializeTradingAssistant(userSettings.openaiApiKey);

    // Create a new thread
    const thread = await createThread({
      userId: session.user.id,
      title: 'Test Thread',
    });

    if (!thread) {
      throw new Error('Failed to create thread');
    }

    console.log('Thread created successfully:', thread);

    // Test 2: Send a message to the thread
    console.log('\nTest 2: Sending a message to the thread...');
    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        content: 'This is a test message',
        userId: session.user.id,
        role: 'user',
      },
    });

    if (!message) {
      throw new Error('Failed to send message');
    }

    console.log('Message sent successfully:', message);

    return NextResponse.json({
      success: true,
      tests: {
        threadCreation: thread,
        messageSending: message,
      },
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
} 