import * as ParseResult from "@effect/schema/ParseResult";
import * as S from "@effect/schema/Schema";
import isValid from "date-fns/isValid";
import parse from "date-fns/parse";
import format from "date-fns/format";

const stringFormat = "yyyy-MM";

export const MonthParam: S.Schema<string, Date> = S.transformOrFail(
  S.string,
  S.DateFromSelf,
  (s) => {
    const parsed = parse(s, stringFormat, new Date());

    if (isValid(parsed)) {
      return ParseResult.success(parsed);
    }

    return ParseResult.failure(ParseResult.type(S.Date.ast, s));
  },
  (date) => ParseResult.success(format(date, stringFormat))
);
