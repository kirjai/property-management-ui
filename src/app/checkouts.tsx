import type { ClaimedCheckout } from "@/db/user/user-db";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";

export const Checkouts = ({
  claimedCheckouts,
}: {
  claimedCheckouts: readonly ClaimedCheckout[];
}) => {
  return (
    <>
      {new Array(3).fill(0).map((_, i) => {
        const day = addDays(new Date(), i);
        const isToday = i === 0;
        const heading = isToday
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : format(day, "dd MMM");

        const checkouts = claimedCheckouts.filter((checkout) =>
          isSameDay(checkout.calendar_event_end, day)
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
            {checkouts.length > 0 ? (
              <div>
                {checkouts.map((checkout) => {
                  return (
                    <div
                      key={checkout.calendar_event_id}
                      className="text-sm px-4 py-2 bg-stone-600"
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
