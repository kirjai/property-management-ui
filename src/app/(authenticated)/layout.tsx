import { MobileNavigation, Navigation } from "@/components/Navigation";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="max-w-7xl pt-6 sm:pt-9 mx-auto gap-6 lg:gap-10 flex flex-col h-full">
      <header>
        <Navigation />
        <MobileNavigation />
      </header>
      <main className="flex flex-col lg:flex-row h-full gap-4 lg:gap-12">
        <div className="flex justify-between px-4 items-center sm:px-6 lg:items-start lg:flex-col lg:justify-normal gap-4 lg:pr-0">
          <div className="text-white font-medium text-lg">
            <p>Welcome</p>
            <h1>Here&rsquo;s what&rsquo;s happening</h1>

            <p className="opacity-50 font-normal text-base">Have a nice day</p>
          </div>
        </div>

        <div className="flex-1 flex w-full">{children}</div>
      </main>
    </div>
  );
}
