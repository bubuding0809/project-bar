# tRPC Next.js App Router Setup Design

## Goal
Implement a fully typed end-to-end API client and server using tRPC in a Next.js App Router environment, including `superjson` for data transformation, `useSuspenseQuery` for React Client components, and TanStack Intent agent skills for future AI assistance.

## Architecture

**Frameworks & Libraries:**
- Next.js 15 (App Router)
- `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`
- `@tanstack/react-query`
- `zod` for input validation
- `superjson` for data serialization (Dates, Maps, Sets over the wire)
- `client-only`, `server-only` to enforce execution boundaries

**File Structure (`src/trpc/`):**
- `init.ts`: Initializes the tRPC server instance `t` with `superjson` transformer and exports a basic `createTRPCContext` that receives request `Headers`. Exports the base `publicProcedure` and `createTRPCRouter`.
- `routers/_app.ts`: Defines the root `appRouter` with a sample `hello` query that takes a `text` string and returns a greeting string.
- `query-client.ts`: Exports a `makeQueryClient` factory configuring React Query's `staleTime`, and integrating `superjson.serialize`/`deserialize` into the dehydration/hydration config.
- `client.tsx`: Client boundary (`"use client"`). Initializes `TRPCProvider`, `QueryClientProvider`, and exposes `TRPCReactProvider` to wrap the Next.js root layout.
- `server.tsx`: Server boundary (`"server-only"`). Creates the `trpc` options proxy for React Server Components to prefetch queries seamlessly using `createTRPCOptionsProxy`.

**API Endpoint:**
- `src/app/api/trpc/[trpc]/route.ts`: Exposes Next.js `GET` and `POST` route handlers utilizing tRPC's `fetchRequestHandler`.

## Integration Points

**Layout wrapper (`src/app/layout.tsx`):**
- Import and wrap `children` in `<TRPCReactProvider>`.

**Example Usage (`src/app/page.tsx` & `src/app/client-greeting.tsx`):**
- The Server Component (`page.tsx`) will use the server caller (`trpc`) to `prefetch` the `hello` query.
- Wrap the client component in `<HydrateClient>` and `<Suspense>`.
- The Client Component (`client-greeting.tsx`) will invoke `useSuspenseQuery(trpc.hello.queryOptions(...))` to retrieve and render the greeting natively without manual `isLoading` state checks.

## Agent Skills integration
- Execute `npx @tanstack/intent@latest install` to pull down the tRPC/React Query agent skills into the workspace so the assistant can natively read tRPC docs on future tasks.
