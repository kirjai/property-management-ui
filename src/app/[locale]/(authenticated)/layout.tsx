import { calendarRoute, homeRoute } from "@/app-routes";
import { MobileNavigation, Navigation } from "@/components/Navigation";
import { Calendar, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { PropsWithChildren, ReactNode } from "react";

const navItems = (t: ReturnType<typeof useTranslations>) => [
  {
    name: (
      <NavLabel
        icon={<Home aria-hidden="true" size={20} />}
        content={t("home")}
      />
    ),
    href: homeRoute,
  },
  {
    name: (
      <NavLabel
        icon={<Calendar aria-hidden="true" size={20} />}
        content={t("calendar")}
      />
    ),
    href: calendarRoute(new Date()),
  },
];

export default function Layout({ children }: PropsWithChildren<{}>) {
  const t = useTranslations("Layout");

  return (
    <div className="max-w-7xl pt-6 sm:pt-9 mx-auto gap-6 lg:gap-10 flex flex-col h-full">
      <header>
        <Navigation items={navItems(t)} />
        <MobileNavigation
          items={navItems(t)}
          messages={{
            openMenu: t("open-menu"),
            closeMenu: t("close-menu"),
          }}
        />
      </header>
      <main className="flex flex-col lg:flex-row h-full gap-4 lg:gap-12">
        <div className="flex justify-between px-4 items-center sm:px-6 lg:items-start lg:flex-col lg:justify-normal gap-4 lg:pr-0">
          <div className="text-white font-medium text-lg">
            <p>{t("welcome")}</p>
            <h1>{t("here-and-rsquo-s-what-and-rsquo-s-happening")}</h1>

            <p className="opacity-50 font-normal text-base">
              {t("have-a-nice-day")}
            </p>
          </div>
        </div>

        <div className="flex-1 flex w-full">{children}</div>
      </main>
    </div>
  );
}

const NavLabel = ({
  content,
  icon,
}: {
  content: ReactNode;
  icon: ReactNode;
}) => {
  return (
    <span className="flex gap-1 items-center">
      <span className="opacity-40">{icon}</span>
      <span>{content}</span>
    </span>
  );
};
