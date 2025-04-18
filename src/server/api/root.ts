import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { listingsRouter } from "./routers/listings";
import { userRouter } from "./routers/user";
import { conversationRouter } from "./routers/conversation";
import { reviewRouter } from "./routers/review";

import { reportsRouter } from "~/server/api/routers/reports";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  listings: listingsRouter,
  user: userRouter,
  conversation: conversationRouter,
  review: reviewRouter,
  report: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
