import {
  getClaimedCheckouts,
  getAdminUnclaimedCheckouts,
} from "@/db/user/user-db";
import {
  User,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import { cookies } from "next/headers";
import Color from "color";

export const Checkouts = async ({ date, user }: { date: Date; user: User }) => {
  const supabase = createServerComponentClient({ cookies });

  const [claimedCheckouts, unclaimedCheckouts] = await Promise.all([
    getClaimedCheckouts(supabase)(user.id, date, addDays(date, 3)),
    getAdminUnclaimedCheckouts(supabase)(user.id, date, addDays(date, 3)),
  ]);

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

        const claimed = claimedCheckouts.filter((checkout) =>
          isSameDay(checkout.calendar_event_end, day)
        );

        const unclaimed = unclaimedCheckouts.filter((checkout) =>
          isSameDay(checkout.event_end, day)
        );

        return (
          <div
            key={i}
            className={`bg-white min-w-[200px] rounded-2xl h-full min-h-[150px] py-4 flex flex-col gap-3 ${
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
              <div>
                {claimed.map((checkout) => {
                  return (
                    <div
                      key={checkout.calendar_event_id}
                      className="text-sm px-4 py-2"
                      style={{
                        backgroundColor: checkout.property_color,
                      }}
                    >
                      {checkout.property_name}
                    </div>
                  );
                })}
                {unclaimed.map((checkout) => {
                  const isDark = Color(checkout.property_color).isDark();

                  return (
                    <div
                      key={checkout.event_id}
                      className={`${
                        isToday ? "bg-primary shadow-md shadow-primary" : ""
                      } ${
                        isDark ? "text-white" : "text-black"
                      } px-4 py-2 text-sm font-medium`}
                      style={{
                        backgroundColor: !isToday
                          ? checkout.property_color
                          : "",
                      }}
                    >
                      {checkout.property_name}
                    </div>
                  );
                })}
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
            className="min-w-[200px] min-h-[150px] bg-white animate-pulse rounded-2xl"
          >
            &nbsp;
          </div>
        );
      })}
    </>
  );
};
