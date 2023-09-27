import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Effect, Option, pipe } from "effect";
import { supabaseEffect } from "@/supabase/supabase";
import formatISO from "date-fns/formatISO";
import subMinutes from "date-fns/subMinutes";
import ical from "node-ical";
import * as NA from "fp-ts/lib/NonEmptyArray";
import { fromFPTSOption } from "@/lib/option";
import isBefore from "date-fns/isBefore";
import isAfter from "date-fns/isAfter";
import format from "date-fns/format";

export const dynamic = "force-dynamic";

// const DRY_RUN = process.env.NODE_ENV === "development";
const DRY_RUN = false;

type DBEvent = {
  id: number;
  event: unknown;
  start: Date;
  end: Date;
  property_platform: number;
};

export async function GET(
  request: NextRequest,
  { params: _params }: { params: Record<string, string> }
) {
  const supabase = createRouteHandlerClient({ cookies });

  return Effect.runPromise(
    queryProperty(supabase).pipe(
      Effect.flatMap((properties: any[]) => {
        if (properties.length === 0) {
          return Effect.succeed({
            status: 200,
            body: "",
          });
        }

        return Effect.all(
          properties.map((property) =>
            processPropertyPlatform(supabase)(property)
          ),
          { concurrency: "unbounded" }
        ).pipe(
          Effect.map(() => ({
            status: 201,
            body: JSON.stringify({ id: properties.map((p) => p.id) }),
          }))
        );
      }),
      Effect.mapBoth({
        onFailure: (error) => {
          console.log(error);
          return new Response(
            JSON.stringify({
              error,
            }),
            {
              status: 500,
            }
          );
        },
        onSuccess: (success) => {
          // if (success.status === 204) {
          //   return new Response("", {
          //     status: 204,
          //   });
          // }

          return new Response(success.body, {
            status: success.status,
          });
          // return NextResponse.json(success, {
          //   status: success.status,
          // });
        },
      })
    )
  );
}

const queryProperty = (supabase: SupabaseClient) =>
  supabaseEffect(() =>
    supabase
      .from("property_platforms")
      .select("*, hosting_platforms ( name )")
      .or(
        // only sync once every 55 minutes
        `last_sync.lt.${formatISO(
          subMinutes(new Date(), 55)
        )},last_sync.is.null`
      )
      .limit(1)
  ).pipe(Effect.mapError((error) => new QueryPropertyError(error)));

const earliestCalendarEvent = (events: NA.NonEmptyArray<ical.VEvent>) =>
  events.reduce((earliest, event) => {
    if (!earliest) return event;
    if (isBefore(event.end, earliest.end)) return event;

    return earliest;
  }, NA.head(events));

const latestCalendarEvent = (events: NA.NonEmptyArray<ical.VEvent>) =>
  events.reduce((latest, event) => {
    if (!latest) return event;
    if (isAfter(event.end, latest.end)) return event;

    return latest;
  }, NA.head(events));

const processPropertyPlatform =
  (supabase: SupabaseClient) => (propertyPlatform: any) => {
    console.log("Processing property platform id", propertyPlatform.id);

    return getCalendarEventsForPropertyPlatform(propertyPlatform).pipe(
      Effect.flatMap((maybeCalendarEvents) => {
        return pipe(
          NA.fromArray(maybeCalendarEvents),
          fromFPTSOption,
          Option.map((calendarEvents) => {
            const earliest = earliestCalendarEvent(calendarEvents);
            const latest = latestCalendarEvent(calendarEvents);

            return getDBCalendarEventsForDateRange(supabase)({
              start: earliest.end,
              end: latest.end,
              propertyPlatform: propertyPlatform.id,
            }).pipe(
              Effect.map((dbEvents) => {
                const { toAdd: toAddIds, toDelete } = reconcileEvents(
                  dbEvents,
                  calendarEvents
                );

                const toAdd = Array.from(toAddIds.values()).flatMap((id) => {
                  const found = calendarEvents.find(
                    (event) => event.uid === id
                  );
                  if (!found) return [];
                  return [found];
                });

                return {
                  toAdd,
                  toDelete: Array.from(toDelete.values()),
                };
              })
            );
          }),
          Option.getOrElse(() =>
            Effect.succeed({
              toDelete: [] as number[],
              toAdd: [] as ical.VEvent[],
            })
          ),
          Effect.flatMap(({ toDelete, toAdd }) => {
            return Effect.all(
              [
                addCalendarEvents(supabase)({
                  propertyPlatform: propertyPlatform.id,
                  events: toAdd,
                }),
                deleteCalendarEvents(supabase)(toDelete),
              ],
              { concurrency: "unbounded" }
            ).pipe(
              Effect.flatMap(() =>
                updateLastSync(supabase)(propertyPlatform.id)
              )
            );
          })
        );
      })
    );
  };

const reconcileEvents = (
  dbEvents: DBEvent[],
  calendarEvents: ical.VEvent[]
) => {
  const toDelete = new Set<DBEvent["id"]>();
  const toAdd = new Set<ical.VEvent["uid"]>();

  dbEvents.forEach((dbEvent) => {
    if (typeof dbEvent.event !== "object" || !(dbEvent.event as any).uid) {
      toDelete.add(dbEvent.id);
      return;
    }

    const matchedCalendarEvent = calendarEvents.find(
      (calendarEvent) => calendarEvent.uid === (dbEvent.event as any).uid
    );

    if (!matchedCalendarEvent) {
      toDelete.add(dbEvent.id);
    }
  });

  calendarEvents.forEach((calendarEvent) => {
    const matchedDBEvent = dbEvents.find((dbEvent) => {
      if (typeof dbEvent.event !== "object" || !(dbEvent.event as any).uid)
        return false;

      return (dbEvent.event as any).uid === calendarEvent.uid;
    });

    if (!matchedDBEvent) {
      toAdd.add(calendarEvent.uid);
    }
  });

  return {
    toDelete,
    toAdd,
  };
};

type EventsFilterFunction = (event: ical.VEvent) => boolean;

const airbnbFilter: EventsFilterFunction = (webEvent) => {
  return Boolean(webEvent.description);
};

const bookingFilter: EventsFilterFunction = (webEvent) => {
  const summary = webEvent.summary as string;
  return summary.toLowerCase() !== "CLOSED - Not available".toLowerCase();
};

const getCalendarEventsForPropertyPlatform = (propertyPlatform: any) => {
  return Effect.tryPromise({
    try: () => ical.async.fromURL(propertyPlatform.calendar_url),
    catch: (error) => new QueryCalendarError(error, propertyPlatform.id),
  }).pipe(
    Effect.map((response) => {
      const filterFunction =
        propertyPlatform.hosting_platforms.name === "Airbnb"
          ? airbnbFilter
          : bookingFilter;

      return Object.values(response)
        .filter((calendarEvent) => calendarEvent.type === "VEVENT")
        .map((calendarEvent) => calendarEvent as ical.VEvent)
        .map((calendarEvent) => {
          return {
            ...calendarEvent,
            end: subMinutes(
              calendarEvent.end,
              calendarEvent.end.getTimezoneOffset()
            ) as ical.DateWithTimeZone,
            start: subMinutes(
              calendarEvent.start,
              calendarEvent.start.getTimezoneOffset()
            ) as ical.DateWithTimeZone,
          };
        })
        .filter(filterFunction);
    })
  );
};

const getDBCalendarEventsForDateRange =
  (supabase: SupabaseClient) =>
  ({
    start,
    end,
    propertyPlatform,
  }: {
    start: Date;
    end: Date;
    propertyPlatform: number;
  }) => {
    const formattedStart = format(start, "yyyy-MM-dd");
    const formattedEnd = format(end, "yyyy-MM-dd");

    return supabaseEffect(() =>
      formattedStart === formattedEnd
        ? supabase
            .from("calendar_events")
            .select("*")
            .eq("property_platform", propertyPlatform)
            .eq("end", formattedStart)
        : supabase
            .from("calendar_events")
            .select("*")
            .eq("property_platform", propertyPlatform)
            .lte("end", format(end, "yyyy-MM-dd"))
            .gte("end", format(start, "yyyy-MM-dd"))
    ).pipe(
      Effect.map((data) => data as DBEvent[]),
      Effect.mapError(
        (error) =>
          new QueryCalendarEventsForDateRangeError(
            error,
            start,
            end,
            propertyPlatform,
            formattedStart,
            formattedEnd
          )
      )
    );
  };

const addCalendarEvents =
  (supabase: SupabaseClient) =>
  ({
    propertyPlatform,
    events,
  }: {
    propertyPlatform: number;
    events: ical.VEvent[];
  }) =>
    supabaseEffect(() =>
      !DRY_RUN
        ? supabase.from("calendar_events").insert(
            events.map((event) => ({
              event,
              end: event.end,
              start: event.start,
              property_platform: propertyPlatform,
            }))
          )
        : supabase.from("calendar_events").select("*")
    ).pipe(
      Effect.mapError(
        (error) =>
          new InsertCalendarEventsError(error, events, propertyPlatform)
      )
    );

const deleteCalendarEvents = (supabase: SupabaseClient) => (ids: number[]) =>
  supabaseEffect(() =>
    DRY_RUN
      ? supabase.from("calendar_events").delete().in("id", ids)
      : supabase.from("calendar_events").select("*").limit(1)
  ).pipe(Effect.mapError((error) => new DeleteCalendarEventsError(error, ids)));

const updateLastSync =
  (supabase: SupabaseClient) => (propertyPlatformId: number) =>
    supabaseEffect(() =>
      !DRY_RUN
        ? supabase
            .from("property_platforms")
            .update({ last_sync: new Date() })
            .eq("id", propertyPlatformId)
        : supabase.from("calendar_events").select("*").limit(1)
    ).pipe(
      Effect.mapError(
        (error) => new UpdateLastSyncError(error, propertyPlatformId)
      )
    );

class QueryCalendarError {
  readonly _tag = "QueryCalendarError";

  constructor(readonly error: unknown, readonly propertyId: any) {}
}

class QueryCalendarEventsForDateRangeError {
  readonly _tag = "QueryCalendarEventsForDateRangeError";

  constructor(
    readonly error: unknown,
    readonly start: Date,
    readonly end: Date,
    readonly propertyPlatformId: number,
    readonly formattedStart: string,
    readonly formattedEnd: string
  ) {}
}
class InsertCalendarEventsError {
  readonly _tag = "InsertCalendarEventsError";

  constructor(
    readonly error: unknown,
    readonly events: any[],
    readonly propertyPlatform: number
  ) {}
}

class DeleteCalendarEventsError {
  readonly _tag = "DeleteCalendarEventsError";

  constructor(readonly error: unknown, readonly ids: number[]) {}
}

class QueryPropertyError {
  readonly _tag = "QueryPropertyError";

  constructor(readonly error: unknown) {}
}

class UpdateLastSyncError {
  readonly _tag = "UpdateLastSyncError";

  constructor(readonly error: unknown, readonly propertyPlatform: number) {}
}
