import { UserCheckoutView } from "@/db/user/user-db";
import addDays from "date-fns/addDays";
import differenceInDays from "date-fns/differenceInDays";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import isSameMonth from "date-fns/isSameMonth";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfWeek";

export const createMonthRange = (date: Date) => {
  const begMonth = startOfMonth(date);
  const firstMonday = startOfWeek(begMonth, { weekStartsOn: 1 });

  const endMonth = endOfMonth(date);
  const lastSunday = endOfWeek(endMonth, { weekStartsOn: 1 });

  return {
    start: firstMonday,
    end: lastSunday,
  };
};

export const createCalendarMonth = (
  { start, end }: { start: Date; end: Date },
  date: Date,
  checkouts: readonly UserCheckoutView[],
  selectedDay?: Date
) => {
  const diff = Math.abs(differenceInDays(start, end));

  return new Array(diff + 1).fill(0).map((_, index) => {
    const _date = addDays(start, index);
    const _checkouts = findCheckoutsForDay(_date, checkouts);
    // const checkins = findCheckinsForDay(_date, checkouts);

    return {
      formattedDate: format(_date, "yyyy-MM-dd"),
      date: _date,
      checkouts: _checkouts.map((checkout) => {
        return {
          id: `${_date.toString()}+${checkout.property_name}`,
          name: `${checkout.property_name}`,
          color: checkout.property_color,
          datetime: format(_date, "yyyy-MM-dd"),
          event: checkout,
        };
      }),
      isSelected: selectedDay ? isSameDay(_date, selectedDay) : false,
      isCurrentMonth: isSameMonth(_date, date),
      isToday: isSameDay(_date, new Date()),
    };
  });
};

const findCheckoutsForDay = (
  day: Date,
  checkouts: readonly UserCheckoutView[]
) => {
  return checkouts.filter((checkout) => isSameDay(checkout.event_end, day));
};
