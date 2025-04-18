import fs from 'fs';
import path from 'path';

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

// Define file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_DIR = path.join(DATA_DIR, 'messages');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MESSAGES_DIR)) {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
}

/**
 * Get all chat threads for a user
 */
export function getChatThreads(userId: string): ChatThread[] {
  const userDir = path.join(MESSAGES_DIR, userId);
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    return [];
  }
  
  try {
    const threadFiles = fs.readdirSync(userDir);
    const threads: ChatThread[] = [];
    
    for (const file of threadFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(userDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
          const thread = JSON.parse(content) as ChatThread;
          threads.push(thread);
        } catch (e) {
          console.error(`Error parsing chat thread file ${file}:`, e);
        }
      }
    }
    
    // Sort by most recent first
    return threads.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error reading chat threads:', error);
    return [];
  }
}

/**
 * Get a specific chat thread by ID
 */
export function getChatThread(userId: string, threadId: string): ChatThread | null {
  const threadPath = path.join(MESSAGES_DIR, userId, `${threadId}.json`);
  
  if (!fs.existsSync(threadPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(threadPath, 'utf8');
    return JSON.parse(content) as ChatThread;
  } catch (error) {
    console.error(`Error reading chat thread ${threadId}:`, error);
    return null;
  }
}

/**
 * Create a new chat thread
 */
export function createChatThread(userId: string, initialMessage?: string): ChatThread {
  const userDir = path.join(MESSAGES_DIR, userId);
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
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
  
  const threadPath = path.join(userDir, `${threadId}.json`);
  fs.writeFileSync(threadPath, JSON.stringify(newThread, null, 2), 'utf8');
  
  return newThread;
}

/**
 * Add a message to a chat thread
 */
export function addMessageToThread(
  userId: string,
  threadId: string,
  role: string,
  content: string,
  image?: string
): Message | null {
  const thread = getChatThread(userId, threadId);
  
  if (!thread) {
    return null;
  }
  
  const message: Message = {
    id: generateId(),
    role: role as 'user' | 'assistant' | 'system',
    content,
    timestamp: Date.now(),
    image
  };
  
  thread.messages.push(message);
  thread.updatedAt = Date.now();
  
  // Update thread title if it's the first user message
  if (role === 'user' && thread.messages.length === 2) {
    thread.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
  }
  
  const threadPath = path.join(MESSAGES_DIR, userId, `${threadId}.json`);
  fs.writeFileSync(threadPath, JSON.stringify(thread, null, 2), 'utf8');
  
  return message;
}

/**
 * Delete a chat thread
 */
export function deleteChatThread(userId: string, threadId: string): boolean {
  const threadPath = path.join(MESSAGES_DIR, userId, `${threadId}.json`);
  
  if (!fs.existsSync(threadPath)) {
    return false;
  }
  
  try {
    fs.unlinkSync(threadPath);
    return true;
  } catch (error) {
    console.error(`Error deleting chat thread ${threadId}:`, error);
    return false;
  }
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 