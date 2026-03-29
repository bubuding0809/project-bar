import 'server-only';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: async () => createTRPCContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
