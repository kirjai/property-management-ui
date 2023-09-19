"use server";
import { SupabaseClient } from "@supabase/supabase-js";
import format from "date-fns/format";
import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { supabaseEffect } from "@/supabase/supabase";

const ClaimedCheckout = S.struct({
  calendar_event_id: S.number,
  event: S.any,
  calendar_event_end: S.string.pipe(S.dateFromString),
  role: S.literal("admin"),
  organization_name: S.string,
  property_name: S.string,
});

export type ClaimedCheckout = S.Schema.To<typeof ClaimedCheckout>;

export const getClaimedCheckouts =
  (supabase: SupabaseClient) =>
  async (userId: string, fromDate: Date, toDate: Date) => {
    return Effect.runPromise(
      supabaseEffect(() =>
        supabase.rpc("get_calendar_events", {
          user_id: userId,
          // start_date: "2021-01-01",
          // end_date: "2025-12-31",
          start_date: format(fromDate, "yyyy-MM-dd"),
          end_date: format(toDate, "yyyy-MM-dd"),
        })
      ).pipe(
        Effect.flatMap((result) =>
          S.parseEither(S.array(ClaimedCheckout))(result)
        )
      )
    );
  };
