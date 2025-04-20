import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { TradingViewService } from '@/lib/market/tradingview';

const strategyConditionSchema = z.object({
  type: z.enum([
    'price_above',
    'price_below',
    'rsi_above',
    'rsi_below',
    'price_crosses_ema',
    'rsi_divergence',
  ]),
  value: z.number().optional(),
});

const strategySchema = z.object({
  name: z.string().min(1),
  conditions: z.array(strategyConditionSchema),
  coins: z.array(z.string()),
});

export const strategyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(strategySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.strategy.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          conditions: input.conditions,
          coins: input.coins,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: strategySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.prisma.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy) {
        throw new Error('Strategy not found');
      }

      if (strategy.userId !== ctx.session.user.id) {
        throw new Error('Not authorized');
      }

      return ctx.prisma.strategy.update({
        where: { id: input.id },
        data: {
          name: input.data.name,
          conditions: input.data.conditions,
          coins: input.data.coins,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.prisma.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy) {
        throw new Error('Strategy not found');
      }

      if (strategy.userId !== ctx.session.user.id) {
        throw new Error('Not authorized');
      }

      return ctx.prisma.strategy.delete({
        where: { id: input.id },
      });
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.strategy.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: 'desc' },
    });
  }),

  evaluate: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.prisma.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Strategy not found',
        });
      }

      const tradingView = new TradingViewService(ctx.session.user.id);
      const results = await Promise.all(
        strategy.coins.map(async (coin: string) => {
          const indicators = await tradingView.getIndicators(coin);
          const divergence = await tradingView.getRSIDivergence(coin);

          const conditions = strategy.conditions as z.infer<typeof strategyConditionSchema>[];
          const evaluation = conditions.map((condition) => {
            switch (condition.type) {
              case 'price_above':
                return {
                  type: condition.type,
                  met: indicators.price > (condition.value || 0),
                  value: indicators.price,
                };
              case 'price_below':
                return {
                  type: condition.type,
                  met: indicators.price < (condition.value || 0),
                  value: indicators.price,
                };
              case 'rsi_above':
                return {
                  type: condition.type,
                  met: indicators.rsi > (condition.value || 0),
                  value: indicators.rsi,
                };
              case 'rsi_below':
                return {
                  type: condition.type,
                  met: indicators.rsi < (condition.value || 0),
                  value: indicators.rsi,
                };
              case 'price_crosses_ema':
                return {
                  type: condition.type,
                  met: Math.abs(indicators.price - indicators.ema) < (condition.value || 1),
                  value: Math.abs(indicators.price - indicators.ema),
                };
              case 'rsi_divergence':
                return {
                  type: condition.type,
                  met: divergence.hasDivergence,
                  value: divergence.type,
                };
              default:
                return {
                  type: condition.type,
                  met: false,
                  value: null,
                };
            }
          });

          return {
            coin,
            indicators,
            divergence,
            conditions: evaluation,
          };
        })
      );

      return results;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.strategy.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),
}); 