import { NextResponse } from 'next/server';
import { 
  getChatThread, 
  addMessageToThread 
} from '@/lib/messageStorage';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT_ID,
});

// GET /api/chat/threads/[threadId]/messages - Get all messages in a thread
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
    
    return NextResponse.json(thread.messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat/threads/[threadId]/messages - Add a message to a thread
export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const userId = 'default-user';
    const { threadId } = params;
    const { role, content, image } = await request.json();
    
    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }
    
    if (role !== 'user' && role !== 'assistant' && role !== 'system') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user", "assistant", or "system"' },
        { status: 400 }
      );
    }
    
    const message = addMessageToThread(userId, threadId, role, content, image);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Chat thread not found' },
        { status: 404 }
      );
    }
    
    // Generate a simple AI response (in a real app, this would call an AI service)
    if (role === 'user') {
      setTimeout(() => {
        const responses = [
          "Based on current market trends, BTC seems to be in a consolidation phase. Consider waiting for a clear breakout pattern before making any moves.",
          "I've analyzed the ETH chart and noticed a bullish divergence on the RSI. This could indicate a potential trend reversal in the coming days.",
          "The recent volume spike in SOL is noteworthy. Historically, this has preceded significant price movements. Keep a close eye on support levels.",
          "Market sentiment indicators are showing extreme fear right now. Historically, this has been a good time for accumulation of quality assets for long-term positions.",
          "Your portfolio currently has a high correlation coefficient. Consider diversifying into assets with lower correlation to BTC to reduce overall volatility."
        ];
        
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToThread(userId, threadId, 'assistant', aiResponse);
      }, 1000);
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error adding chat message:', error);
    return NextResponse.json(
      { error: 'Failed to add chat message' },
      { status: 500 }
    );
  }
} 