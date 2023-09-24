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
          const ui = property.events.ongoing ? (
            <BusyIndicator
              icon={<CalendarXIcon className="text-red-600" size="30px" />}
              text={`Busy until ${format(
                property.events.ongoing.event_end,
                "dd MMM"
              )}`}
            />
          ) : property.events.start || property.events.end ? (
            <div className="grid grid-cols-2 divide-x-2">
              <div className="px-2 flex justify-center items-center">
                {property.events.end ? (
                  <div className="flex flex-col gap-1">
                    <span className="bg-red-700 px-2 py-1 rounded-md font-bold text-sm text-center text-white">
                      Check-out
                    </span>
                    <span className="text-xs text-center">
                      {differenceInDays(
                        property.events.end.event_end,
                        property.events.end.event_start
                      )}{" "}
                      nights
                    </span>
                  </div>
                ) : (
                  <VacantIndicator />
                )}
              </div>
              <div className="px-2 flex justify-center items-center">
                {property.events.start ? (
                  <div className="flex flex-col gap-1">
                    <span className="bg-red-700 px-2 py-1 rounded-md font-bold text-sm text-center text-white">
                      Check-in
                    </span>
                    <span className="text-xs text-center">
                      {differenceInDays(
                        property.events.start.event_end,
                        property.events.start.event_start
                      )}{" "}
                      nights
                    </span>
                  </div>
                ) : (
                  <VacantIndicator />
                )}
              </div>
            </div>
          ) : (
            <BusyIndicator
              icon={<CalendarCheck className="text-green-500" size="30px" />}
              text={"Vacant"}
            />
          );

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

              {ui}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BusyIndicator = ({
  icon,
  text,
}: {
  icon: ReactNode;
  text: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-stone-600">{text}</span>
    </div>
  );
};

const VacantIndicator = () => {
  return (
    <span className="text-sm text-green-600 font-bold border-2 border-green-600 px-2 py-[2px] rounded-md">
      Vacant
    </span>
  );
};