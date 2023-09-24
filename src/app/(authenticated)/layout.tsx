import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <main className="h-full flex flex-col lg:flex-row max-w-7xl pt-10 mx-auto">
      <div className="flex justify-between p-4 items-center sm:px-6 lg:items-start lg:flex-col lg:justify-normal gap-4">
        <div className="text-white font-medium text-lg">
          <p>Welcome</p>
          <h1>Here&rsquo;s what&rsquo;s happening</h1>

          <p className="opacity-50 font-normal text-base">Have a nice day</p>
        </div>
      </div>

      <div className="h-full w-full">{children}</div>
    </main>
  );
}
