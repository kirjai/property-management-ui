import type { SupabaseClient } from "@supabase/supabase-js";
import { Effect } from "effect";
import jwt from "jsonwebtoken";

type SupabasePromiseLike = ReturnType<SupabaseClient["rpc"]>;

export const supabaseEffect = (query: () => SupabasePromiseLike) =>
  Effect.tryPromise({
    try: async () => {
      const { data, error } = await query();

      if (error) throw error;

      return data;
    },
    catch: (error) => ({
      _tag: "SupabaseError" as const,
      error,
    }),
  });

export const supabaseClientOptions = (userId: string) => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET!);

  return {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  };
};
