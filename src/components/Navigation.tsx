"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import Logo from "./denn-logo.svg";

export const MobileNavigation = ({
  items,
  messages: { openMenu, closeMenu },
}: {
  items: {
    name: JSX.Element;
    href: string;
  }[];
  messages: {
    openMenu: ReactNode;
    closeMenu: ReactNode;
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden relative z-10">
      {isOpen ? (
        <div
          className={classNames(
            "bottom-0 fixed bg-gradient-to-t from-primary from-10% to-transparent w-full h-full animate-in fade-in"
          )}
        />
      ) : null}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <Popover onOpenChange={setIsOpen} open={isOpen}>
          <PopoverTrigger
            className={classNames(
              "bg-primary text-secondary border-2 border-white rounded-full p-3 shadow-stone-400",
              !isOpen ? "shadow-xl" : "shadow-none"
            )}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">{isOpen ? closeMenu : openMenu}</span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="bg-transparent border-none shadow-none w-auto"
          >
            <NavigationMenu orientation="vertical">
              <NavigationMenuList className="flex flex-col space-x-0 gap-4 text-sm font-semibold">
                {items.map((item) => {
                  return (
                    <NavigationMenuItem
                      key={item.href}
                      className="bg-white px-4 py-2 rounded-xl w-full text-center shadow-md"
                    >
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export const Navigation = ({
  items,
}: {
  items: {
    name: JSX.Element;
    href: string;
  }[];
}) => {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="flex items-center px-4 sm:px-6 lg:pr-0 gap-10">
      <div className="bg-primary flex justify-center items-center py-3 px-4 rounded-xl shadow">
        <Image src={Logo} alt="denn.place logo" className="w-24 sm:w-32" />
      </div>

      <div className="hidden sm:block">
        <NavigationMenu orientation="horizontal" className="">
          <NavigationMenuList className="flex justify-between items-center gap-3">
            {items.map((item) => {
              const isActive =
                (pathname.split("/")[2] ?? "") === item.href.split("/")[1];

              return (
                <NavigationMenuItem
                  key={item.href}
                  className={classNames(
                    "font-semibold py-2 rounded-xl px-4 text-sm text-secondary",
                    isActive ? "bg-primary" : ""
                  )}
                >
                  <Link href={item.href} className="py-4" locale={locale}>
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};
