import { prisma } from '@/server/db';
import { generateId } from '@/utils/id';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Create a new chat thread
 */
export function createChatThread(userId: string, initialMessage?: string): ChatThread {
  const threadId = generateId();
  const now = Date.now();
  
  const newThread: ChatThread = {
    id: threadId,
    title: initialMessage?.slice(0, 30) || 'New Conversation',
    messages: [
      {
        id: generateId(),
        role: 'assistant',
        content: "Hello! I'm your trading assistant. How can I help you with your cryptocurrency trading today?",
        timestamp: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };
  
  if (initialMessage) {
    newThread.messages.push({
      id: generateId(),
      role: 'user',
      content: initialMessage,
      timestamp: now
    });
  }

  // Save the thread to the database
  prisma.chatThread.create({
    data: {
      id: threadId,
      userId,
      title: newThread.title,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      messages: {
        create: newThread.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.timestamp),
          userId
        }))
      }
    }
  }).catch((error: Error) => {
    console.error('Error creating chat thread:', error);
  });
  
  return newThread;
}