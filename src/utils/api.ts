import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const api = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
}); 