import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import OpenAI from 'openai';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { prisma } from '@/server/db';

export const chatRouter = createTRPCRouter({
  streamChat: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!userSettings?.openaiApiKey) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'OpenAI API key not configured. Please set it in your settings.',
        });
      }

      const openai = new OpenAI({
        apiKey: userSettings.openaiApiKey,
        organization: userSettings.openaiOrganization ?? undefined,
        project: userSettings.openaiProjectId ?? undefined,
      });

      return observable<string>((emit) => {
        const stream = openai.chat.completions.create({
          model: userSettings.openaiModel ?? 'gpt-3.5-turbo',
          messages: input.messages,
          stream: true,
        });

        (async () => {
          try {
            const streamResponse = await stream;
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                emit.next(content);
              }
            }
            emit.complete();
          } catch (error) {
            console.error('OpenAI API error:', error);
            emit.error(new Error('Failed to analyze chart. Please check your OpenAI API key and try again.'));
          }
        })();

        return () => {
          // Cleanup if needed
        };
      });
    }),
}); 