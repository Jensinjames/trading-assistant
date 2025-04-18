import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/server/db";
import { settingsSchema, type Settings } from "./types";

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: {
          openaiApiKey: true,
          openaiOrganization: true,
          openaiProjectId: true,
          tradingViewApiKey: true,
          telegramBotToken: true,
        },
      });

      const typedSettings: Settings = {
        openaiApiKey: settings?.openaiApiKey ?? "",
        openaiOrganization: settings?.openaiOrganization ?? "",
        openaiProjectId: settings?.openaiProjectId ?? "",
        tradingViewApiKey: settings?.tradingViewApiKey ?? "",
        telegramBotToken: settings?.telegramBotToken ?? "",
      };

      return typedSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load settings",
      });
    }
  }),

  update: protectedProcedure
    .input(settingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        const settings = await prisma.userSettings.upsert({
          where: { userId },
          update: input,
          create: {
            userId,
            ...input,
          },
          select: {
            openaiApiKey: true,
            openaiOrganization: true,
            openaiProjectId: true,
            tradingViewApiKey: true,
            telegramBotToken: true,
          },
        });

        const typedSettings: Settings = {
          openaiApiKey: settings.openaiApiKey ?? "",
          openaiOrganization: settings.openaiOrganization ?? "",
          openaiProjectId: settings.openaiProjectId ?? "",
          tradingViewApiKey: settings.tradingViewApiKey ?? "",
          telegramBotToken: settings.telegramBotToken ?? "",
        };

        return typedSettings;
      } catch (error) {
        console.error('Error updating settings:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settings",
        });
      }
    }),
}); 