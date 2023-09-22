"use server";
import { SupabaseClient } from "@supabase/supabase-js";
import format from "date-fns/format";
import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { supabaseEffect } from "@/supabase/supabase";
import * as O from "@effect/data/Option";
import isSameDay from "date-fns/isSameDay";
import groupBy from "lodash/groupBy";

const DBAdminProperty = S.struct({
  property_id: S.number,
  property_name: S.string,
  platform_id: S.number,
  platform_name: S.string,
});

// either all event data is present - or none
const EventData = S.union(
  S.struct({
    event_start: S.string.pipe(S.dateFromString),
    event_end: S.string.pipe(S.dateFromString),
    event_id: S.number,
    event: S.any,
  }),
  S.struct({
    event_start: S.null,
    event_end: S.null,
    event_id: S.null,
    event: S.null,
  })
);

export type AdminProperty = Awaited<
  ReturnType<ReturnType<typeof getAdminProperties>>
>[number];

export const getAdminProperties =
  (supabase: SupabaseClient) => (userId: string, date: Date) => {
    return Effect.runPromise(
      supabaseEffect(() =>
        supabase.rpc("get_admin_properties", {
          user_id: userId,
          specific_date: format(date, "yyyy-MM-dd"),
        })
      ).pipe(
        Effect.flatMap((properties) => {
          return Effect.all([
            S.parseEither(S.array(DBAdminProperty))(properties),
            S.parseEither(S.array(EventData))(properties),
          ]).pipe(
            Effect.map(([properties, eventData]) => {
              return properties.map((property, i) => ({
                ...property,
                ...eventData[i],
              }));
            })
          );
        }),
        Effect.map((properties) => {
          type DBEvent = (typeof properties)[number] & {
            event_id: NonNullable<(typeof properties)[number]["event_id"]>;
          };
          return properties.reduce(
            (acc, property, _, arr) => {
              if (!!acc.find((i) => i.property.id === property.property_id))
                return acc;

              const sameProperty = arr.filter(
                (item) => item.property_id === property.property_id
              );

              const events = O.fromNullable(
                sameProperty.filter(
                  (
                    p
                  ): p is typeof p & {
                    event_id: NonNullable<(typeof p)["event_id"]>;
                  } => p.event_id !== null
                )
              ).pipe(
                O.map((events) => {
                  const byTag = groupBy(events, (event) =>
                    isSameDay(event.event_start, date)
                      ? "start"
                      : isSameDay(event.event_end, date)
                      ? "end"
                      : "ongoing"
                  );

                  return {
                    start: (byTag.start ?? [])[0] ?? null,
                    end: (byTag.end ?? [])[0] ?? null,
                    ongoing: (byTag.ongoing ?? [])[0] ?? null,
                  };
                }),
                O.getOrElse(() => ({
                  start: null,
                  end: null,
                  ongoing: null,
                }))
              );

              acc.push({
                property: {
                  id: property.property_id,
                  name: property.property_name,
                },
                platforms: sameProperty.map((p) => ({
                  id: p.platform_id,
                  name: p.platform_name,
                })),
                events,
              });

              return acc;
            },
            [] as {
              property: { id: number; name: string };
              platforms: { id: number; name: string }[];
              events: {
                start: DBEvent | null;
                end: DBEvent | null;
                ongoing: DBEvent | null;
              };
            }[]
          );
        })
      )
    );
  };

const UserCheckoutView = S.struct({
  event_id: S.number,
  event: S.any,
  event_start: S.string.pipe(S.dateFromString),
  event_end: S.string.pipe(S.dateFromString),
  property_platform: S.number,
  property_id: S.number,
  property_name: S.string,
  property_color: S.union(S.string.pipe(S.nonEmpty()), S.null),
  claiming_user_id: S.union(S.string, S.null),
});

export const getCheckoutsForUser =
  (supabase: SupabaseClient) =>
  (
    userId: string,
    dates: {
      fromDate: Date;
      toDate: Date;
    }
  ) => {
    return Effect.runPromise(
      supabaseEffect(() =>
        supabase.rpc("get_user_checkouts_view_for_date_range", {
          user_id: userId,
          start_date: format(dates.fromDate, "yyyy-MM-dd"),
          end_date: format(dates.toDate, "yyyy-MM-dd"),
        })
      ).pipe(Effect.flatMap(S.parseEither(S.array(UserCheckoutView))))
    );
  };
