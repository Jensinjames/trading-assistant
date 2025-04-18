import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import OpenAI from 'openai';
import { env } from '@/env.mjs';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';

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
    .mutation(async ({ input }) => {
      if (!env.OPENAI_API_KEY) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'OpenAI API key not found in environment variables',
        });
      }

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION,
        project: process.env.OPENAI_PROJECT_ID,
      });

      return observable<string>((emit) => {
        const stream = openai.chat.completions.create({
          model: 'gpt-4',
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