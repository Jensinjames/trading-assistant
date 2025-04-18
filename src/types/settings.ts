export interface Settings {
  openaiApiKey: string;
  openaiModel: string;
  openaiOrganization: string;
  openaiProjectId: string;
  tradingViewApiKey: string;
  telegramBotToken: string;
}

export interface OpenAIModel {
  id: string;
  name: string;
  created: number;
  owned_by: string;
}

export interface OpenAITestResult {
  success: boolean;
  timestamp: number;
  response: string;
} 