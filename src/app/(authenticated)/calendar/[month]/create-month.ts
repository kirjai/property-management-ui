import { UserCheckoutView } from "@/db/user/user-db";
import { isAfter } from "date-fns";
import addDays from "date-fns/addDays";
import differenceInDays from "date-fns/differenceInDays";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import format from "date-fns/format";
import isBefore from "date-fns/isBefore";
import isSameDay from "date-fns/isSameDay";
import isSameMonth from "date-fns/isSameMonth";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import uniqBy from "lodash/uniqBy";
import groupBy from "lodash/groupBy";

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

export type CalendarDay = ReturnType<typeof createCalendarMonth>[number];

export const createCalendarMonth = (
  { start, end }: { start: Date; end: Date },
  date: Date,
  calendarEvents: readonly UserCheckoutView[],
  selectedDay?: Date
) => {
  const diff = Math.abs(differenceInDays(start, end));
  const properties = uniqBy(
    calendarEvents.map((event) => ({
      id: event.property_id,
      name: event.property_name,
      color: event.property_color,
      organizationRole: event.organization_role,
    })),
    (property) => property.id
  );

  const eventsByProperty = groupBy(
    calendarEvents,
    (event) => event.property_id
  );

  return new Array(diff + 1).fill(0).map((_, index) => {
    const _date = addDays(start, index);

    return {
      formattedDate: format(_date, "yyyy-MM-dd"),
      date: _date,
      isSelected: selectedDay ? isSameDay(_date, selectedDay) : false,
      isCurrentMonth: isSameMonth(_date, date),
      isToday: isSameDay(_date, new Date()),
      properties: properties.map((property) => {
        const propertyEvents = eventsByProperty[property.id] ?? [];

        const checkout = propertyEvents.find((event) =>
          isSameDay(event.event_end, _date)
        );
        const checkin = propertyEvents.find((event) =>
          isSameDay(event.event_start, _date)
        );
        const ongoing = propertyEvents.find(
          (event) =>
            isAfter(_date, event.event_start) &&
            isBefore(_date, event.event_end)
        );

        if (ongoing) {
          return {
            property,
            _tag: "ongoing" as const,
            ongoing,
          };
        }
        if (checkout && !checkin) {
          return {
            property,
            _tag: "checkout" as const,
            checkout,
          };
        }
        if (checkin && !checkout) {
          return {
            property,
            _tag: "checkin" as const,
            checkin,
          };
        }
        if (checkin && checkout) {
          return {
            property,
            _tag: "checkin-checkout" as const,
            checkin,
            checkout,
          };
        }
        return {
          property,
          _tag: "vacant" as const,
        };
      }),
    };
  });

  // return new Array(diff + 1).fill(0).map((_, index) => {
  //   const _date = addDays(start, index);
  //   const _checkouts = findCheckoutsForDay(_date, calendarEvents);
  //   const checkins = findCheckinsForDay(_date, calendarEvents);

  //   return {
  //     formattedDate: format(_date, "yyyy-MM-dd"),
  //     date: _date,
  //     checkouts: _checkouts.map((checkout) => {
  //       return {
  //         id: `${_date.toString()}+${checkout.property_name}`,
  //         propertyId: checkout.property_id,
  //         name: `${checkout.property_name}`,
  //         color: checkout.property_color,
  //         datetime: format(_date, "yyyy-MM-dd"),
  //         event: checkout,
  //         duration: differenceInDays(checkout.event_end, checkout.event_start),
  //       };
  //     }),
  //     checkins: checkins.map((checkin) => {
  //       return {
  //         id: `${_date.toString()}+${checkin.property_name}`,
  //         propertyId: checkin.property_id,
  //         name: `${checkin.property_name}`,
  //         color: checkin.property_color,
  //         datetime: format(_date, "yyyy-MM-dd"),
  //         event: checkin,
  //         duration: differenceInDays(checkin.event_end, checkin.event_start),
  //       };
  //     }),
  //     isSelected: selectedDay ? isSameDay(_date, selectedDay) : false,
  //     isCurrentMonth: isSameMonth(_date, date),
  //     isToday: isSameDay(_date, new Date()),
  //   };
  // });
};

const findCheckoutsForDay = (
  day: Date,
  checkouts: readonly UserCheckoutView[]
) => {
  return checkouts.filter((checkout) => isSameDay(checkout.event_end, day));
};

const findCheckinsForDay = (
  day: Date,
  checkouts: readonly UserCheckoutView[]
) => {
  return checkouts.filter((checkout) => isSameDay(checkout.event_start, day));
};
