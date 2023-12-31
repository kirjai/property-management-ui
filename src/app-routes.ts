import * as S from "@effect/schema/Schema";
import { MonthParam } from "./app/[locale]/(authenticated)/calendar/[month]/month-param";
import * as E from "@effect/data/Either";

export const loginRoute = "/login";
export const homeRoute = "/";
export const calendarRoute = (date?: Date, fallback?: string) => {
  if (!date) return "/calendar";

  const month = S.encodeEither(MonthParam)(date);
  return E.isRight(month)
    ? `/calendar/${month.right}`
    : fallback ?? "/calendar";
};
