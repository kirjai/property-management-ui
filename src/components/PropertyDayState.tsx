import { CalendarCheck, CalendarXIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ReactNode } from "react";

type PropertyEvent = {
  durationInDays: number;
};

type State =
  | {
      _tag: "ongoing";
      ends: Date;
    }
  | {
      _tag: "terminating";
      endingEvent: PropertyEvent;
    }
  | {
      _tag: "starting";
      startingEvent: PropertyEvent;
    }
  | {
      _tag: "both";
      endingEvent: PropertyEvent;
      startingEvent: PropertyEvent;
    }
  | {
      _tag: "vacant";
    };

export const PropertyDayState = ({ state }: { state: State }) => {
  const t = useTranslations("Home");
  const locale = useLocale();

  return state._tag === "ongoing" ? (
    <BusyIndicator
      icon={<CalendarXIcon className="text-red-600" size="30px" />}
      text={`${t("busy-until")} ${Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
      }).format(state.ends)}`}
    />
  ) : state._tag === "terminating" ||
    state._tag === "starting" ||
    state._tag === "both" ? (
    <div className="grid grid-cols-2 divide-x-2">
      <div className="px-2 flex justify-center items-center">
        {state._tag === "terminating" || state._tag === "both" ? (
          <div className="flex flex-col gap-1">
            <span className="bg-red-700 px-2 py-1 rounded-md font-bold text-xs text-center text-white">
              {t("checkout")}
            </span>
            <span className="text-xs text-center">
              {state.endingEvent.durationInDays}{" "}
              {t("nights", { count: state.endingEvent.durationInDays })}
            </span>
          </div>
        ) : (
          <VacantIndicator />
        )}
      </div>
      <div className="px-2 flex justify-center items-center">
        {state._tag === "starting" || state._tag === "both" ? (
          <div className="flex flex-col gap-1">
            <span className="bg-red-700 px-2 py-1 rounded-md font-bold text-xs text-center text-white">
              {t("checkin")}
            </span>
            <span className="text-xs text-center">
              {state.startingEvent.durationInDays}{" "}
              {t("nights", { count: state.startingEvent.durationInDays })}
            </span>
          </div>
        ) : (
          <VacantIndicator />
        )}
      </div>
    </div>
  ) : (
    <BusyIndicator
      icon={<CalendarCheck className="text-green-500" size="30px" />}
      text={t("vacant")}
    />
  );
};

const BusyIndicator = ({
  icon,
  text,
}: {
  icon: ReactNode;
  text: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-stone-600">{text}</span>
    </div>
  );
};

const VacantIndicator = () => {
  const t = useTranslations("Home");

  return (
    <span className="text-xs text-green-600 font-bold border-2 border-green-600 px-2 py-[2px] rounded-md">
      {t("vacant")}
    </span>
  );
};
