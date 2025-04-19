export interface OpenAIModelInfo {
  id: string;
  name: string;
  created: number;
  owned_by: string;
  isLatest: boolean;
  isTurbo: boolean;
  isVision: boolean;
  contextWindow: number;
  costPer1kTokens: number;
  maxOutputTokens: number;
}

export interface OpenAIModelResponse {
  models: OpenAIModelInfo[];
  defaultModel: string;
  error?: string;
}

// Model capabilities and constraints
export const MODEL_CONSTRAINTS = {
  'gpt-4-0125-preview': {
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'function_calling', 'json_mode']
  },
  'gpt-4-1106-preview': {
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'function_calling', 'json_mode']
  },
  'gpt-4-vision-preview': {
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'vision']
  },
  'gpt-4': {
    contextWindow: 8192,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.03,
    capabilities: ['chat', 'function_calling']
  },
  'gpt-3.5-turbo-0125': {
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'function_calling', 'json_mode']
  },
  'gpt-3.5-turbo-1106': {
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'function_calling', 'json_mode']
  },
  'gpt-3.5-turbo': {
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'function_calling']
  }
} as const;

export type OpenAIModelId = keyof typeof MODEL_CONSTRAINTS;

// Helper functions
export function isVisionModel(modelId: string): boolean {
  return modelId.includes('vision');
}

export function getModelConstraints(modelId: string) {
  return MODEL_CONSTRAINTS[modelId as OpenAIModelId] || MODEL_CONSTRAINTS['gpt-3.5-turbo'];
}

export function calculateMaxTokens(modelId: string, inputTokens: number): number {
  const constraints = getModelConstraints(modelId);
  const availableTokens = constraints.contextWindow - inputTokens;
  return Math.min(availableTokens, constraints.maxOutputTokens);
}

export function estimateCost(modelId: string, totalTokens: number): number {
  const { costPer1kTokens } = getModelConstraints(modelId);
  return (totalTokens / 1000) * costPer1kTokens;
} 