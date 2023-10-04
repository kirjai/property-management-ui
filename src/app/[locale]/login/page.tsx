import { homeRoute } from "@/app-routes";
import { PassageLogin } from "@/components/PassageLogin";
import { getAuthenticatedUserFromSession } from "@/lib/passage";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Login() {
  const maybeUser = await getAuthenticatedUserFromSession();

  if (maybeUser.isAuthorized) return redirect(homeRoute);

  return (
    <main className="h-full flex flex-col justify-end pb-4 md:justify-center">
      <PassageLogin />
    </main>
  );
}
