import * as S from "@effect/schema/Schema";
import { MonthParam } from "./app/(authenticated)/calendar/[month]/month-param";
import * as E from "@effect/data/Either";

export const loginRoute = "/login";
export const homeRoute = "/";
export const calendarRoute = (date: Date, fallback?: string) => {
  const month = S.encodeEither(MonthParam)(date);
  return E.isRight(month)
    ? `/calendar/${month.right}`
    : fallback ?? "/calendar";
};
