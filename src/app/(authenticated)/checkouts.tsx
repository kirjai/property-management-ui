import { getCheckoutsForUser } from "@/db/user/user-db";
import {
  User,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import { cookies } from "next/headers";
import Color from "color";
import { AlertCircle } from "lucide-react";

export const Checkouts = async ({ date, user }: { date: Date; user: User }) => {
  const supabase = createServerComponentClient({ cookies });

  const checkouts = await getCheckoutsForUser(supabase)(user.id, {
    fromDate: date,
    toDate: addDays(date, 3),
  });
  return (
    <>
      {new Array(3).fill(0).map((_, i) => {
        const day = addDays(date, i);
        const isToday = i === 0;
        const heading = isToday
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : format(day, "dd MMM");

        const dayCheckouts = checkouts.filter((checkout) =>
          isSameDay(checkout.event_end, day)
        );

        const claimed = dayCheckouts.filter(
          (checkout) => checkout.claiming_user_id !== null
        );
        const unclaimed = dayCheckouts.filter(
          (checkout) => checkout.claiming_user_id === null
        );

        return (
          <div
            key={i}
            className={`bg-white min-w-[200px] rounded-2xl py-4 flex flex-col gap-3 ${
              isToday ? "border-primary border-2" : "opacity-60"
            }`}
          >
            <span
              className={`${
                isToday ? "font-bold" : "text-stone-700"
              } text-xl px-4`}
            >
              {heading}
            </span>
            {claimed.length > 0 || unclaimed.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  {unclaimed.length > 0 ? (
                    <span className="px-4 text-xs text-stone-600">Yours</span>
                  ) : null}
                  <div>
                    {claimed.length > 0 ? (
                      <>
                        {claimed.map((checkout) => {
                          const isDark = checkout.property_color
                            ? Color(checkout.property_color).isDark()
                            : false;

                          return (
                            <p
                              key={checkout.event_id}
                              className={`text-sm px-4 py-2 font-medium ${
                                isDark ? "text-white" : "text-black"
                              } ${
                                !checkout.property_color ? "bg-stone-400" : ""
                              }`}
                              style={{
                                backgroundColor:
                                  checkout.property_color ?? undefined,
                              }}
                            >
                              {checkout.property_name}
                            </p>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <span className="px-4 text-stone-600 text-xs">-</span>
                      </>
                    )}
                  </div>
                </div>

                {unclaimed.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-red-700 flex items-center px-4 gap-1">
                      <span className="text-xs font-semibold">Unclaimed</span>
                      <AlertCircle size={16} />
                    </span>
                    <div>
                      {unclaimed.map((checkout) => {
                        const isDark = checkout.property_color
                          ? Color(checkout.property_color).isDark()
                          : false;

                        return (
                          <div
                            key={checkout.event_id}
                            className={`${
                              isToday
                                ? "bg-primary shadow-md shadow-primary"
                                : ""
                            } ${
                              isDark ? "text-white" : "text-black"
                            } px-4 py-2 text-sm font-medium ${
                              !checkout.property_color ? "bg-stone-400" : ""
                            }`}
                            style={{
                              backgroundColor: !isToday
                                ? checkout.property_color ?? undefined
                                : "",
                            }}
                          >
                            {checkout.property_name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="px-4">🙌 All clear!</p>
            )}
          </div>
        );
      })}
    </>
  );
};

export const CheckoutsFallback = () => {
  return (
    <>
      {new Array(3).fill(0).map((_, i) => {
        return (
          <div
            key={i}
            className="min-w-[200px] bg-white animate-pulse rounded-2xl"
          >
            &nbsp;
          </div>
        );
      })}
    </>
  );
};
