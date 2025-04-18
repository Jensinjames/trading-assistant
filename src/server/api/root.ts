import { createTRPCRouter, protectedProcedure } from './trpc';
import { chatRouter } from './routers/chat';
import { strategyRouter } from './routers/strategy';
import { prisma } from '@/server/db';
import { JobScheduler } from '@/server/jobs/scheduler';
import { settingsRouter } from "./routers/settings";

// Inline alert router
const alertRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return prisma.alertRule.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),
});

// Inline jobs router
const jobsRouter = createTRPCRouter({
  manualRefresh: protectedProcedure.mutation(async ({ ctx }) => {
    const scheduler = new JobScheduler();
    await scheduler.manualRefresh();
    return { success: true };
  }),
});

export const appRouter = createTRPCRouter({
  chat: chatRouter,
  strategy: strategyRouter,
  alert: alertRouter,
  jobs: jobsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter; 