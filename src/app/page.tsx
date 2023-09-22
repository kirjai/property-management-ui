import { loginRoute } from "@/app-routes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import addDays from "date-fns/addDays";
import { Checkouts, CheckoutsFallback } from "./checkouts";
import { Properties } from "./properties";
import format from "date-fns/format";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect(loginRoute);

  // for easier debugging
  const date = addDays(new Date(), 0);

  return (
    <main className="h-full flex flex-col lg:flex-row max-w-7xl pt-10 mx-auto">
      <div className="flex justify-between p-4 items-center sm:px-6 lg:items-start lg:flex-col lg:justify-normal gap-4">
        <div className="text-white font-medium text-lg">
          <p>Welcome</p>
          <h1>Here&rsquo;s what&rsquo;s happening</h1>

          <p className="opacity-50 font-normal text-base">Have a nice day</p>
        </div>

        <div className="text-white font-bold text-2xl">
          {format(date, "dd MMM")}
        </div>
      </div>

      <div className="h-full w-full">
        <div className="h-full bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:bg-transparent sm:p-6">
          <div className="pb-6 bg-off-grey rounded-3xl sm:shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="px-4 pt-6">
                <h3 className="font-bold text-xl">Your check-outs</h3>
              </div>

              <div className="flex overflow-x-auto gap-3 px-4 pb-2 items-stretch min-h-[150px]">
                <Suspense fallback={<CheckoutsFallback />}>
                  <Checkouts date={date} user={user} />
                </Suspense>
              </div>
            </div>

            <Suspense fallback={null}>
              <Properties date={date} user={user} />
            </Suspense>
            {/* event detail - notes, length of stay */}

            {/* link to properties, if manager in some */}
            {/* link to calendar */}
          </div>
        </div>
      </div>
    </main>
  );
}
