import type { SupabaseClient } from "@supabase/supabase-js";
import { Effect } from "effect";

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
