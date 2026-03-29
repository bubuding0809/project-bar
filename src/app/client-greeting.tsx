'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function ClientGreeting() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.hello.queryOptions({ text: 'from tRPC + React Query + SuperJSON' }));
  
  return (
    <div className="p-4 mt-6 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Data received:
      </p>
      <p className="mt-1 text-lg text-emerald-600 dark:text-emerald-400 font-bold">
        {data.greeting}
      </p>
    </div>
  );
}
