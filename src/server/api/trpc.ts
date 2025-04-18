import { initTRPC } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await getServerSession(authOptions);
  return {
    session,
    headers: opts.req.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
}); 