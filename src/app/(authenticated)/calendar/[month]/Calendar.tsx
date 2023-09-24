import { UserCheckoutView } from "@/db/user/user-db";
import classNames from "classnames";
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MonthParam } from "./month-param";
import * as S from "@effect/schema/Schema";
import * as E from "@effect/data/Either";
import { calendarRoute } from "@/app-routes";

type Day = {
  date: string;
  checkouts: {
    id: string;
    name: string;
    color: string | null;
    datetime: string;
    event: UserCheckoutView;
  }[];
  isSelected: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export const Calendar = ({ days, date }: { days: Day[]; date: Date }) => {
  const selectedDay = days.find((day) => day.isSelected);
  const nextMonth = S.encodeEither(MonthParam)(addMonths(date, 1));
  const previousMonth = S.encodeEither(MonthParam)(addMonths(date, -1));
  const todayLink = S.encodeEither(MonthParam)(new Date());

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4 lg:flex-none">
        <h3 className="font-bold text-xl">
          <time dateTime={`${format(date, "yyyy-MM")}`}>
            {format(date, "MMMM yyyy")}
          </time>
        </h3>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <Link
              href={calendarRoute(addMonths(date, -1))}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-stone-300 pr-1 text-stone-400 hover:text-stone-500 focus:relative md:w-9 md:pr-0 md:hover:bg-stone-50"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href={calendarRoute(new Date())}
              className="hidden border-y border-stone-300 px-3.5 text-sm font-semibold text-stone-900 hover:bg-stone-50 focus:relative md:block self-center py-[7px]"
            >
              Today
            </Link>
            <span className="relative -mx-px h-5 w-px bg-stone-300 md:hidden" />
            <Link
              href={calendarRoute(addMonths(date, 1))}
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-stone-300 pl-1 text-stone-400 hover:text-stone-500 focus:relative md:w-9 md:pl-0 md:hover:bg-stone-50"
            >
              <span className="sr-only">Next month</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center"></div>
        </div>
      </header>
      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-stone-300 bg-stone-200 text-center text-xs font-semibold leading-6 text-stone-700 lg:flex-none">
          <div className="bg-white py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
        </div>
        <div className="flex bg-stone-200 text-xs leading-6 text-stone-700 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:auto-rows-fr lg:gap-px">
            {days.map((day) => (
              <div
                key={day.date}
                className={classNames(
                  day.isCurrentMonth
                    ? "bg-white"
                    : "bg-stone-50 text-stone-500",
                  "relative px-3 py-2"
                )}
              >
                <time
                  dateTime={day.date}
                  className={
                    day.isToday
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-white"
                      : undefined
                  }
                >
                  {day.date.split("-").pop()?.replace(/^0/, "") ?? null}
                </time>
                {day.checkouts.length > 0 && (
                  <ol className="mt-2">
                    {day.checkouts.slice(0, 2).map((event) => (
                      <li key={event.id}>
                        <a href={"#"} className="group flex">
                          <p className="flex-auto truncate font-medium text-stone-900 group-hover:text-primary">
                            {event.name}
                          </p>
                          {/* <time
                            dateTime={event.datetime}
                            className="ml-3 hidden flex-none text-stone-500 group-hover:text-indigo-600 xl:block"
                          >
                            {event.time}
                          </time> */}
                        </a>
                      </li>
                    ))}
                    {day.checkouts.length > 2 && (
                      <li className="text-stone-500">
                        + {day.checkouts.length - 2} more
                      </li>
                    )}
                  </ol>
                )}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 gap-px auto-rows-fr lg:hidden">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                className={classNames(
                  day.isCurrentMonth ? "bg-white" : "bg-stone-50",
                  (day.isSelected || day.isToday) && "font-semibold",
                  day.isSelected && "text-white",
                  !day.isSelected && day.isToday && "text-primary",
                  !day.isSelected &&
                    day.isCurrentMonth &&
                    !day.isToday &&
                    "text-stone-900",
                  !day.isSelected &&
                    !day.isCurrentMonth &&
                    !day.isToday &&
                    "text-stone-500",
                  "flex h-14 flex-col px-3 py-2 hover:bg-stone-100 focus:z-10"
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    day.isSelected &&
                      "flex h-6 w-6 items-center justify-center rounded-full",
                    day.isSelected && day.isToday && "bg-indigo-600",
                    day.isSelected && !day.isToday && "bg-stone-900",
                    "ml-auto"
                  )}
                >
                  {day.date.split("-").pop()?.replace(/^0/, "") ?? null}
                </time>
                <span className="sr-only">{day.checkouts.length} events</span>
                {day.checkouts.length > 0 && (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {day.checkouts.map((checkout) => (
                      <span
                        key={checkout.id}
                        className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-stone-400"
                      />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedDay ? (
        <>
          {selectedDay.checkouts.length > 0 && (
            <div className="px-4 py-10 sm:px-6 lg:hidden">
              <ol className="divide-y divide-stone-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
                {selectedDay.checkouts.map((checkout) => (
                  <li
                    key={checkout.id}
                    className="group flex p-4 pr-6 focus-within:bg-stone-50 hover:bg-stone-50"
                  >
                    <div className="flex-auto">
                      <p className="font-semibold text-stone-900">
                        {checkout.name}
                      </p>
                      {/* <time
                        dateTime={checkout.datetime}
                        className="mt-2 flex items-center text-stone-700"
                      >
                        <ClockIcon
                          className="mr-2 h-5 w-5 text-stone-400"
                          aria-hidden="true"
                        />
                        {checkout.time}
                      </time> */}
                    </div>
                    <a
                      href={""}
                      className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-stone-900 opacity-0 shadow-sm ring-1 ring-inset ring-stone-300 hover:ring-stone-400 focus:opacity-100 group-hover:opacity-100"
                    >
                      Edit<span className="sr-only">, {checkout.name}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
