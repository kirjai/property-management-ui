"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import Link from "next/link";
import { calendarRoute, homeRoute } from "@/app-routes";
import classNames from "classnames";

const navItems = [
  {
    name: <>Home</>,
    href: homeRoute,
  },
  {
    name: <>Calendar</>,
    href: calendarRoute(new Date()),
  },
];

export const MobileNavigation = () => {
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
              "bg-primary text-white border-2 border-white rounded-full p-3 shadow-stone-400",
              !isOpen ? "shadow-xl" : "shadow-none"
            )}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">
              {isOpen ? "Close menu" : "Open menu"}
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="bg-transparent border-none shadow-none w-auto"
          >
            <NavigationMenu orientation="vertical">
              <NavigationMenuList className="flex flex-col space-x-0 gap-4 text-sm font-medium">
                {navItems.map((item) => {
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
