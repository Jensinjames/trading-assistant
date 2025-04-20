export type Settings = {
  openaiApiKey?: string;
  openaiOrganization?: string;
  openaiProjectId?: string;
  openaiModel?: string;
  tradingViewApiKey?: string;
  telegramBotToken?: string;
  aiProvider: 'openai' | 'ollama';
  ollamaEndpoint?: string;
  ollamaModel?: string;
};

export interface OpenAIModel {
  id: string;
  name: string;
  maxTokens: number;
  trainingData: string;
}

export interface OpenAITestResult {
  success: boolean;
  response: string;
  error?: string;
}