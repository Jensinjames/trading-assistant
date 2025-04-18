import { NextResponse } from 'next/server';
import { 
  getChatThread, 
  deleteChatThread 
} from '@/lib/messageStorage';

// GET /api/chat/threads/[threadId] - Get a specific thread
export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const userId = 'default-user';
    const { threadId } = params;
    
    const thread = getChatThread(userId, threadId);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/threads/[threadId] - Delete a specific thread
export async function DELETE(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const userId = 'default-user';
    const { threadId } = params;
    
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