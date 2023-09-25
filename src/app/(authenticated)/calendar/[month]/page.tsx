import { homeRoute, loginRoute } from "@/app-routes";
import { getCheckoutsForUser } from "@/db/user/user-db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MonthParam } from "./month-param";
import * as S from "@effect/schema/Schema";
import * as E from "@effect/data/Either";
import * as O from "@effect/data/Option";
import { createCalendarMonth, createMonthRange } from "./create-month";
import { Calendar } from "./Calendar";
import { DayParam } from "./day-param";

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: { month: string };
  searchParams: Record<string, string>;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect(loginRoute);

  const monthDate = S.parseEither(MonthParam)(params.month);
  if (E.isLeft(monthDate)) return redirect(homeRoute);

  const { start, end } = createMonthRange(monthDate.right);
  const checkouts = await getCheckoutsForUser(supabase)(user.id, {
    fromDate: start,
    toDate: end,
  });

  const selectedDay = S.parseOption(DayParam)(searchParams.day);

  const calendarDays = createCalendarMonth(
    {
      start,
      end,
    },
    monthDate.right,
    checkouts,
    O.getOrUndefined(selectedDay)
  );

  return (
    <div className="h-full bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:bg-transparent sm:p-6">
      <div className="bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:shadow-sm pb-6">
        <Calendar days={calendarDays} date={monthDate.right} />
      </div>
    </div>
  );
}
