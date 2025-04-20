export type AssistantRole = 'user' | 'assistant' | 'system';
export type MessageCategory = 'general' | 'analysis' | 'advice' | 'alert';

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  model: string;
  systemPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: AssistantRole;
  content: string;
  userId: string;
  threadId: string;
  assistantId?: string;
  category: MessageCategory;
  reactions: MessageReaction[];
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  imageUrl?: string | null;
}

export interface ChatThread {
  id: string;
  userId: string;
  assistantId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}