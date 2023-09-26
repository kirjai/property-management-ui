import { PropertyDayState } from "@/components/PropertyDayState";
import { getAdminProperties } from "@/db/user/user-db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import differenceInDays from "date-fns/differenceInDays";
import format from "date-fns/format";
import { CalendarCheck, CalendarXIcon } from "lucide-react";
import { cookies } from "next/headers";
import { ReactNode } from "react";

export const Properties = async ({
  user,
  date,
}: {
  user: User;
  date: Date;
}) => {
  const supabase = createServerComponentClient({ cookies });

  const adminProperties = await getAdminProperties(supabase)(user.id, date);

  if (adminProperties.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-4 pt-6">
        <h3 className="font-bold text-xl">Your properties</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
        {adminProperties.map((property) => {
          const state = property.events.ongoing
            ? {
                _tag: "ongoing" as const,
                ends: property.events.ongoing.event_end,
              }
            : property.events.start && !property.events.end
            ? {
                _tag: "starting" as const,
                startingEvent: {
                  durationInDays: differenceInDays(
                    property.events.start.event_end,
                    property.events.start.event_start
                  ),
                },
              }
            : property.events.end && !property.events.start
            ? {
                _tag: "terminating" as const,
                endingEvent: {
                  durationInDays: differenceInDays(
                    property.events.end.event_end,
                    property.events.end.event_start
                  ),
                },
              }
            : property.events.end && property.events.start
            ? {
                _tag: "both" as const,
                startingEvent: {
                  durationInDays: differenceInDays(
                    property.events.start.event_end,
                    property.events.start.event_start
                  ),
                },
                endingEvent: {
                  durationInDays: differenceInDays(
                    property.events.end.event_end,
                    property.events.end.event_start
                  ),
                },
              }
            : {
                _tag: "vacant" as const,
              };

          return (
            <div
              key={property.property.id}
              className={`rounded-2xl bg-white p-4 flex flex-col gap-3 ${
                property.events.end ||
                property.events.start ||
                property.events.ongoing
                  ? "border-2 border-red-700"
                  : ""
              }`}
            >
              <p className="text-sm font-semibold">{property.property.name}</p>

              <PropertyDayState state={state} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
