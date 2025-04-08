import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  // addToCart
  // removeFromCart
  // getCartItems
});
