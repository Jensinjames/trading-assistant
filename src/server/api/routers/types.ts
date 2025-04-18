import { z } from "zod";

export const settingsSchema = z.object({
  openaiApiKey: z.string().optional(),
  openaiOrganization: z.string().optional(),
  openaiProjectId: z.string().optional(),
  openaiModel: z.string().optional(),
  tradingViewApiKey: z.string().optional(),
  telegramBotToken: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>; 