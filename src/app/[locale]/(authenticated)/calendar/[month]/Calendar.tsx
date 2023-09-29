import classNames from "classnames";
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import { ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import Link from "next/link";
import { calendarRoute } from "@/app-routes";
import * as S from "@effect/schema/Schema";
import { DayParam } from "./day-param";
import * as O from "@effect/data/Option";
import Color from "color";
import { PropertyDayState } from "@/components/PropertyDayState";
import * as Match from "@effect/match";
import { CalendarDay } from "./create-month";
import { pipe } from "@effect/data/Function";
import differenceInDays from "date-fns/differenceInDays";
import { useLocale, useTranslations } from "next-intl";

const checkoutProperties = (properties: CalendarDay["properties"]) =>
  properties.filter(
    (
      p
    ): p is typeof p & ({ _tag: "checkout" } | { _tag: "checkin-checkout" }) =>
      p._tag === "checkout" || p._tag === "checkin-checkout"
  );

const adminPropertiesFilter = (properties: CalendarDay["properties"]) => {
  return properties.filter((property) => {
    const role = property.property.organizationRole;

    if (role === "admin") return true;

    return property._tag === "checkout" || property._tag === "checkin-checkout";
  });
};

export const Calendar = ({
  days,
  date,
}: {
  days: CalendarDay[];
  date: Date;
}) => {
  const selectedDay = days.find((day) => day.isSelected);
  const selectedDayProperties = adminPropertiesFilter(
    selectedDay?.properties ?? []
  );
  const t = useTranslations("Calendar");
  const locale = useLocale();

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 lg:flex-none">
        <h3 className="font-bold text-xl">
          <time dateTime={`${format(date, "yyyy-MM")}`}>
            {t("checkouts")}{" "}
            {Intl.DateTimeFormat(locale, {
              month: "long",
              year: "numeric",
            }).format(date)}
          </time>
        </h3>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white md:items-stretch">
            <Link
              href={calendarRoute(addMonths(date, -1))}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-stone-300 pr-1 text-stone-400 hover:text-stone-500 focus:relative md:w-9 md:pr-0 md:hover:bg-stone-50"
            >
              <span className="sr-only">{t("previous-month")}</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href={calendarRoute(new Date())}
              className="hidden border-y border-stone-300 px-3.5 text-sm font-semibold text-stone-900 hover:bg-stone-50 focus:relative md:block self-center py-[7px]"
            >
              {t("today")}
            </Link>
            <span className="relative -mx-px h-5 w-px bg-stone-300 md:hidden" />
            <Link
              href={calendarRoute(addMonths(date, 1))}
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-stone-300 pl-1 text-stone-400 hover:text-stone-500 focus:relative md:w-9 md:pl-0 md:hover:bg-stone-50"
            >
              <span className="sr-only">{t("next-month")}</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center"></div>
        </div>
      </div>
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
            {days.map((day) => {
              const checkouts = checkoutProperties(day.properties);

              return (
                <div
                  key={day.formattedDate}
                  className={classNames(
                    day.isCurrentMonth
                      ? "bg-white"
                      : "bg-stone-50 text-stone-500",
                    "relative py-2"
                  )}
                >
                  <span className="px-3 flex">
                    <time
                      dateTime={day.formattedDate}
                      className={
                        day.isToday
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-white"
                          : undefined
                      }
                    >
                      {day.formattedDate.split("-").pop()?.replace(/^0/, "") ??
                        null}
                    </time>
                  </span>
                  {checkouts.length > 0 ? (
                    <ol className="mt-2">
                      {checkouts.map((property) => {
                        const isDark = property.checkout.property_color
                          ? Color(property.checkout.property_color).isDark()
                          : false;

                        return (
                          <li key={property.checkout.property_id}>
                            <a href={"#"} className="group flex">
                              <span
                                className={classNames(
                                  "flex items-center justify-between w-full pl-3 pr-1",
                                  isDark ? "text-white" : "text-stone-900",
                                  !property.checkout.property_color
                                    ? "bg-stone-400"
                                    : ""
                                )}
                                style={{
                                  backgroundColor:
                                    property.checkout.property_color ??
                                    undefined,
                                }}
                              >
                                <span
                                  className={classNames(
                                    "flex-auto truncate font-medium"
                                  )}
                                >
                                  {property.checkout.property_name}
                                </span>
                                <span>
                                  {property._tag === "checkin-checkout" ? (
                                    <LogIn size={14} />
                                  ) : null}
                                </span>
                              </span>

                              {/* <time
                            dateTime={event.datetime}
                            className="ml-3 hidden flex-none text-stone-500 group-hover:text-indigo-600 xl:block"
                          >
                            {event.time}
                          </time> */}
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="isolate grid w-full grid-cols-7 gap-px auto-rows-fr lg:hidden">
            {days.map((day) => {
              const dayParam = S.encodeOption(DayParam)(day.date);
              const params = new URLSearchParams();
              if (O.isSome(dayParam)) {
                params.append("day", dayParam.value);
              }

              const checkouts = checkoutProperties(day.properties);

              return (
                <Link
                  href={`?${params.toString()}`}
                  locale={locale}
                  key={day.formattedDate}
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
                    dateTime={day.formattedDate}
                    className={classNames(
                      day.isSelected &&
                        "flex h-6 w-6 items-center justify-center rounded-full",
                      day.isSelected && day.isToday && "bg-primary",
                      day.isSelected && !day.isToday && "bg-stone-900",
                      "ml-auto"
                    )}
                  >
                    {day.formattedDate.split("-").pop()?.replace(/^0/, "") ??
                      null}
                  </time>
                  <span className="sr-only">{checkouts.length} events</span>
                  {checkouts.length > 0 && (
                    <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                      {checkouts.map((checkout) => (
                        <span
                          key={checkout.checkout.event_id}
                          className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-stone-400"
                        />
                      ))}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {selectedDay ? (
        <>
          {selectedDayProperties.length > 0 ? (
            <div className="px-4 py-10 sm:pb-0 sm:px-6 lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDayProperties.map((property) => {
                  const state = pipe(
                    Match.value(property),
                    Match.when({ _tag: "ongoing" }, (ongoing) => ({
                      _tag: "ongoing" as const,
                      ends: ongoing.ongoing.event_end,
                    })),
                    Match.when({ _tag: "checkout" }, (checkout) => ({
                      _tag: "terminating" as const,
                      endingEvent: {
                        durationInDays: differenceInDays(
                          checkout.checkout.event_end,
                          checkout.checkout.event_start
                        ),
                      },
                    })),
                    Match.when(
                      { _tag: "checkin-checkout" },
                      (checkinCheckout) => ({
                        _tag: "both" as const,
                        endingEvent: {
                          durationInDays: differenceInDays(
                            checkinCheckout.checkout.event_end,
                            checkinCheckout.checkout.event_start
                          ),
                        },
                        startingEvent: {
                          durationInDays: differenceInDays(
                            checkinCheckout.checkin.event_end,
                            checkinCheckout.checkin.event_start
                          ),
                        },
                      })
                    ),
                    Match.when({ _tag: "checkin" }, (checkin) => ({
                      _tag: "starting" as const,
                      startingEvent: {
                        durationInDays: differenceInDays(
                          checkin.checkin.event_end,
                          checkin.checkin.event_start
                        ),
                      },
                    })),
                    Match.when({ _tag: "vacant" }, () => ({
                      _tag: "vacant" as const,
                    })),
                    Match.exhaustive
                  );

                  const isDark = property.property.color
                    ? Color(property.property.color).isDark()
                    : false;

                  return (
                    <div
                      key={property.property.id}
                      className={classNames(
                        `rounded-2xl bg-white p-4 flex flex-col gap-3 border-2`
                      )}
                      style={{
                        borderColor: property.property.color ?? undefined,
                      }}
                    >
                      <div className="flex-auto flex flex-col gap-4">
                        <div className="">
                          <span
                            className={classNames(
                              "font-semibold text-sm p-2 rounded-lg",
                              isDark ? "text-white" : "text-stone-900"
                            )}
                            style={{
                              backgroundColor:
                                property.property.color ?? undefined,
                            }}
                          >
                            {property.property.name}
                          </span>
                        </div>

                        <PropertyDayState state={state} />
                      </div>
                      {/* <a
                      // href={""}
                      className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-stone-900 opacity-0 shadow-sm ring-1 ring-inset ring-stone-300 hover:ring-stone-400 focus:opacity-100 group-hover:opacity-100"
                    >
                      Edit<span className="sr-only">, {checkout.name}</span>
                    </a> */}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
