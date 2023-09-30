import { loginRoute } from "@/app-routes";
import { redirect } from "next/navigation";
import addDays from "date-fns/addDays";
import { Checkouts, CheckoutsFallback } from "./checkouts";
import { Properties } from "./properties";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getAuthenticatedUserFromSession } from "@/lib/passage";

export const dynamic = "force-dynamic";

function Home({ userId }: { userId: string }) {
  const t = useTranslations("Home");

  // for easier debugging
  const date = addDays(new Date(), 0);

  return (
    <div className="h-full w-full bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:bg-transparent sm:p-6 sm:pt-0">
      <div className="pb-6 lg:pb-8 bg-off-grey rounded-3xl rounded-b-none sm:rounded-b-3xl sm:shadow-sm h-full sm:h-auto">
        <div className="flex flex-col gap-3">
          <div className="px-4 pt-6 lg:pt-8 lg:px-6">
            <h3 className="font-bold text-xl">{t("your-check-outs")}</h3>
          </div>

          <div className="flex overflow-x-auto gap-3 px-4 lg:px-6 pb-2 items-stretch min-h-[150px]">
            <Suspense fallback={<CheckoutsFallback />}>
              <Checkouts date={date} userId={userId} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={null}>
          <Properties date={date} userId={userId} />
        </Suspense>
        {/* event detail - notes, length of stay */}

        {/* link to properties, if manager in some */}
        {/* link to calendar */}
      </div>
    </div>
  );
}

export default async function AsyncHome() {
  const maybeUser = await getAuthenticatedUserFromSession();

  if (!maybeUser.isAuthorized) return redirect(loginRoute);

  return <Home userId={maybeUser.userId} />;
}
