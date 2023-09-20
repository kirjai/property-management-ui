import formatISO from "date-fns/formatISO";
import subMinutes from "date-fns/subMinutes";
import { Effect, Option, pipe } from "effect";
import { NextResponse } from "next/server";
import ical from "node-ical";
import * as NA from "fp-ts/lib/NonEmptyArray";
import isBefore from "date-fns/isBefore";
import isAfter from "date-fns/isAfter";
import format from "date-fns/format";
import { fromFPTSOption } from "@/lib/option";
import { SupabaseClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const DRY_RUN = false;

const queryPlatformPropertyToProcess = (supabase: SupabaseClient) =>
  Effect.tryPromise({
    try: async () => {
      const { data, error } = await supabase
        .from("property_platforms")
        .select("*, hosting_platforms ( name )")
        .or(
          `last_sync.lt.${formatISO(
            subMinutes(new Date(), 55)
          )},last_sync.is.null`
        )
        .limit(1);

      if (error) throw error;

      return data[0] as PropertyPlatform | undefined;
    },
    catch: (error) => new QueryPlatformPropertyError(error),
  });

class QueryPlatformPropertyError {
  readonly _tag = "QueryPlatformPropertyError";

  constructor(readonly error: unknown) {}
}

class QueryCalendarError {
  readonly _tag = "QueryCalendarError";

  constructor(readonly error: unknown) {}
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

class UpdateLastSyncError {
  readonly _tag = "UpdateLastSyncError";

  constructor(readonly error: unknown, readonly propertyPlatform: number) {}
}

class PropertyPlatformProcessingError {
  readonly _tag = "PropertyPlatformProcessingError";
  constructor(
    readonly error: unknown,
    readonly propertyPlaftorm: PropertyPlatform
  ) {}
}

class NoPropertyPlatform {
  readonly _tag = "NoPropertyPlatform";
}

type HostingPlatform = "Booking.com" | "Airbnb";

type PropertyPlatform = {
  id: number;
  calendar_url: string;
  platform: number;
  property: number;
  hosting_platforms: {
    name: HostingPlatform;
  };
};

type CalendarEvent = ical.VEvent;
type DBEvent = {
  id: number;
  event: unknown;
  end: Date;
  property_platform: number;
};

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  return Effect.runPromise(
    queryPlatformPropertyToProcess(supabase).pipe(
      Effect.flatMap((propertyPlatform) =>
        Effect.fromNullable(propertyPlatform).pipe(
          Effect.mapError(() => new NoPropertyPlatform())
        )
      ),
      Effect.flatMap(processPlatformProperty(supabase)),
      Effect.catchTag("NoPropertyPlatform", () => {
        return Effect.succeed({});
      }),
      Effect.mapBoth({
        onFailure: (error) => {
          console.log(error);
          return new NextResponse(
            JSON.stringify({
              error,
            }),
            {
              status: 500,
            }
          );
        },
        onSuccess: () => {
          return NextResponse.json({
            success: true,
          });
        },
      })
    )
  );
}

const processPlatformProperty =
  (supabase: SupabaseClient) =>
  (
    propertyPlatform: PropertyPlatform
  ): Effect.Effect<
    never,
    PropertyPlatformProcessingError | NoPropertyPlatform,
    null
  > => {
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
              toAdd: [] as CalendarEvent[],
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
      }),
      Effect.flatMap(() => queryPlatformPropertyToProcess(supabase)),
      Effect.mapError(
        (error) => new PropertyPlatformProcessingError(error, propertyPlatform)
      ),
      Effect.flatMap((maybeNextPropertyPlatform) =>
        Effect.fromNullable(maybeNextPropertyPlatform).pipe(
          Effect.mapError(() => new NoPropertyPlatform())
        )
      ),
      Effect.flatMap((nextPropertyPlatform) =>
        processPlatformProperty(supabase)(nextPropertyPlatform)
      )
    );
  };

type EventsFilterFunction = (event: CalendarEvent) => boolean;

const airbnbFilter: EventsFilterFunction = (webEvent) => {
  return Boolean(webEvent.description);
};

const bookingFilter: EventsFilterFunction = (webEvent) => {
  const summary = webEvent.summary as string;
  return summary.toLowerCase() !== "CLOSED - Not available".toLowerCase();
};

const getCalendarEventsForPropertyPlatform = (
  propertyPlatform: PropertyPlatform
) => {
  return Effect.tryPromise({
    try: () => ical.async.fromURL(propertyPlatform.calendar_url),
    catch: (error) => new QueryCalendarError(error),
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

const earliestCalendarEvent = (events: NA.NonEmptyArray<CalendarEvent>) =>
  events.reduce((earliest, event) => {
    if (!earliest) return event;
    if (isBefore(event.end, earliest.end)) return event;

    return earliest;
  }, NA.head(events));

const latestCalendarEvent = (events: NA.NonEmptyArray<CalendarEvent>) =>
  events.reduce((latest, event) => {
    if (!latest) return event;
    if (isAfter(event.end, latest.end)) return event;

    return latest;
  }, NA.head(events));

const getDBCalendarEventsForDateRange =
  (supabase: SupabaseClient) =>
  ({
    start,
    end,
    propertyPlatform,
  }: {
    start: Date;
    end: Date;
    propertyPlatform: PropertyPlatform["id"];
  }) => {
    const formattedStart = format(start, "yyyy-MM-dd");
    const formattedEnd = format(end, "yyyy-MM-dd");

    return Effect.tryPromise({
      try: async () => {
        const query =
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
                .gte("end", format(start, "yyyy-MM-dd"));

        const { data, error } = await query;

        if (error) throw error;

        return data as DBEvent[];
      },
      catch: (error) =>
        new QueryCalendarEventsForDateRangeError(
          error,
          start,
          end,
          propertyPlatform,
          formattedStart,
          formattedEnd
        ),
    });
  };

const reconcileEvents = (
  dbEvents: DBEvent[],
  calendarEvents: CalendarEvent[]
) => {
  const toDelete = new Set<DBEvent["id"]>();
  const toAdd = new Set<CalendarEvent["uid"]>();

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

const addCalendarEvents =
  (supabase: SupabaseClient) =>
  ({
    propertyPlatform,
    events,
  }: {
    propertyPlatform: number;
    events: CalendarEvent[];
  }) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await (!DRY_RUN
          ? supabase.from("calendar_events").insert(
              events.map((event) => ({
                event,
                end: event.end,
                start: event.start,
                property_platform: propertyPlatform,
              }))
            )
          : supabase.from("calendar_events").select("*"));

        if (error) throw error;
        return data;
      },
      catch: (error) =>
        new InsertCalendarEventsError(error, events, propertyPlatform),
    });

const deleteCalendarEvents = (supabase: SupabaseClient) => (ids: number[]) =>
  Effect.tryPromise({
    try: async () => {
      const { data, error } = await (!DRY_RUN
        ? supabase.from("calendar_events").delete().in("id", ids)
        : supabase.from("calendar_events").select("*").limit(1));

      if (error) throw error;

      return data;
    },
    catch: (error) => new DeleteCalendarEventsError(error, ids),
  });

const updateLastSync =
  (supabase: SupabaseClient) => (propertyPlatformId: number) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await (!DRY_RUN
          ? supabase
              .from("property_platforms")
              .update({ last_sync: new Date() })
              .eq("id", propertyPlatformId)
          : supabase.from("calendar_events").select("*").limit(1));

        if (error) throw error;

        return data;
      },
      catch: (error) => new UpdateLastSyncError(error, propertyPlatformId),
    });
