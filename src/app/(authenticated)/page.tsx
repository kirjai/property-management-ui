import { loginRoute } from "@/app-routes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import addDays from "date-fns/addDays";
import { Checkouts, CheckoutsFallback } from "./checkouts";
import { Properties } from "./properties";
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
    <div className="h-full w-full bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:bg-transparent sm:p-6 sm:pt-0">
      <div className="pb-6 bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:shadow-sm h-full sm:h-auto">
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
  );
}
