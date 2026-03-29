import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query((opts) => {
      return { greeting: `hello ${opts.input.text}` };
    }),
});

export type AppRouter = typeof appRouter;
