import { NextResponse } from 'next/server';
import { 
  getChatThreads, 
  createChatThread, 
  deleteChatThread 
} from '@/lib/messageStorage';

// GET /api/chat/threads - Get all threads for a user
export async function GET() {
  try {
    // For simplicity, we're using a default user ID
    const userId = 'default-user';
    const threads = getChatThreads(userId);
    
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching chat threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat threads' },
      { status: 500 }
    );
  }
}

// POST /api/chat/threads - Create a new thread
export async function POST(request: Request) {
  try {
    const userId = 'default-user';
    const { initialMessage } = await request.json();
    
    const newThread = createChatThread(userId, initialMessage);
    
    return NextResponse.json(newThread);
  } catch (error) {
    console.error('Error creating chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to create new chat thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/threads - Delete a thread
export async function DELETE(request: Request) {
  try {
    const userId = 'default-user';
    const { threadId } = await request.json();
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    const success = deleteChatThread(userId, threadId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete chat thread' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat thread' },
      { status: 500 }
    );
  }
} 