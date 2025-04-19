import { z } from "zod";

// Define supported OpenAI models
// These are the current production models as of 2024
const SUPPORTED_MODELS = [
  'gpt-4-0125-preview',      // Latest GPT-4 Turbo
  'gpt-4-1106-preview',      // Previous GPT-4 Turbo
  'gpt-4-vision-preview',    // GPT-4 with vision capabilities
  'gpt-4',                   // Base GPT-4
  'gpt-3.5-turbo-0125',     // Latest GPT-3.5 Turbo
  'gpt-3.5-turbo-1106',     // Previous GPT-3.5 Turbo
  'gpt-3.5-turbo',          // Auto-updating to latest 3.5
] as const;

type OpenAIModel = typeof SUPPORTED_MODELS[number];

// Helper function to validate model name format
const isValidModelFormat = (model: string) => {
  // Matches patterns like:
  // gpt-4-XXXX-preview
  // gpt-4-vision-preview
  // gpt-3.5-turbo-XXXX
  // gpt-3.5-turbo
  // gpt-4
  return /^gpt-(4|3\.5)(-turbo|-vision)?(-\d{4})?(-preview)?$/.test(model);
};

export const settingsSchema = z.object({
  openaiApiKey: z.string()
    .regex(/^sk-[A-Za-z0-9]{32,}$/, 'Invalid OpenAI API key format')
    .optional(),
  openaiOrganization: z.string()
    .regex(/^org-[A-Za-z0-9]{24}$/, 'Invalid OpenAI organization ID format')
    .optional(),
  openaiProjectId: z.string()
    .regex(/^proj-[A-Za-z0-9]{24}$/, 'Invalid OpenAI project ID format')
    .optional(),
  openaiModel: z.string()
    .refine(
      (model) => SUPPORTED_MODELS.includes(model as OpenAIModel) || isValidModelFormat(model),
      {
        message: 'Unsupported OpenAI model. Must be a valid GPT-3.5 or GPT-4 model.',
      }
    )
    .default('gpt-3.5-turbo-0125')
    .optional(),
  tradingViewApiKey: z.string().optional(),
  telegramBotToken: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;