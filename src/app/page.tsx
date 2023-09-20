import { loginRoute } from "@/app-routes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminProperties, getClaimedCheckouts } from "@/db/user/user-db";
import addDays from "date-fns/addDays";
import { Checkouts } from "./checkouts";
import { Properties } from "./properties";
import format from "date-fns/format";
import subDays from "date-fns/subDays";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect(loginRoute);

  // for easier debugging
  const date = subDays(new Date(), 0);

  const [claimedCheckouts, adminProperties] = await Promise.all([
    getClaimedCheckouts(supabase)(user.id, date, addDays(date, 3)),
    getAdminProperties(supabase)(user.id, date),
  ]);

  return (
    <main className="h-full flex flex-col lg:flex-row max-w-7xl pt-10 mx-auto">
      <div className="flex justify-between p-4 items-center sm:px-6">
        <div className="text-white font-medium text-lg lg:w-1/3">
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
          <div className="pb-6 bg-off-grey rounded-3xl">
            <div className="flex flex-col gap-3">
              <div className="px-4 pt-6">
                <h3 className="font-bold text-xl">Your checkouts</h3>
              </div>

              <div className="flex overflow-x-auto gap-3 px-4 pb-2">
                <Checkouts claimedCheckouts={claimedCheckouts} date={date} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="px-4 pt-6">
                <h3 className="font-bold text-xl">Your properties</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
                <Properties properties={adminProperties} />
              </div>
            </div>
            {/* event detail - notes, length of stay */}

            {/* link to properties, if manager in some */}
            {/* link to calendar */}
          </div>
        </div>
      </div>
    </main>
  );
}
