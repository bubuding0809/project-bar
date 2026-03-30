export const dynamic = "force-dynamic";

import Image from "next/image";
import { Suspense } from "react";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { ClientGreeting } from "./client-greeting";

export default async function Home() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.hello.queryOptions({ text: 'from tRPC + React Query + SuperJSON' })
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-8">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            tRPC Setup Complete!
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This page is pre-fetching data on the server using React Server Components, and hydrating it seamlessly down to the client component below via <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm">superjson</code>.
          </p>

          <HydrateClient>
            <Suspense fallback={<div className="p-4 mt-6 text-zinc-500 animate-pulse">Loading tRPC data...</div>}>
              <ClientGreeting />
            </Suspense>
          </HydrateClient>
        </div>
      </main>
    </div>
  );
}
