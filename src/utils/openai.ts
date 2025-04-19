import { encode } from 'gpt-tokenizer';
import { 
  type OpenAIModelId,
  getModelConstraints,
  calculateMaxTokens,
  estimateCost
} from '@/types/openai';

export interface TokenUsage {
  inputTokens: number;
  maxOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Calculate token usage and estimated cost for a chat conversation
 */
export function calculateTokenUsage(
  messages: { role: string; content: string }[],
  modelId: OpenAIModelId
): TokenUsage {
  // Calculate input tokens
  const inputTokens = messages.reduce((total, message) => {
    // Add 4 tokens for message metadata
    return total + encode(message.content).length + 4;
  }, 0);

  // Get max output tokens based on model constraints
  const maxOutputTokens = calculateMaxTokens(modelId, inputTokens);

  // Calculate total tokens (input + estimated output)
  const totalTokens = inputTokens + maxOutputTokens;

  // Calculate estimated cost
  const estimatedCost = estimateCost(modelId, totalTokens);

  return {
    inputTokens,
    maxOutputTokens,
    totalTokens,
    estimatedCost
  };
}

/**
 * Validate if a message is within token limits for a given model
 */
export function validateMessageTokens(
  message: string,
  modelId: OpenAIModelId
): { isValid: boolean; tokenCount: number } {
  const tokenCount = encode(message).length;
  const { contextWindow } = getModelConstraints(modelId);
  
  return {
    isValid: tokenCount < contextWindow,
    tokenCount
  };
}

/**
 * Format cost as a readable string
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return '< $0.01';
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count as a readable string
 */
export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
} 