import { homeRoute } from "@/app-routes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return redirect(homeRoute);

  return (
    <main className="h-full">
      <div className="flex flex-col h-full justify-between sm:justify-center sm:items-center">
        <div className="sm:hidden" />
        {/* illustration? */}

        <div className="bg-white rounded-3xl rounded-b-none sm:rounded-b-3xl p-7 py-10 flex flex-col gap-6 sm:w-[500px]">
          <form
            className="flex flex-col gap-4"
            action="/api/auth/login"
            method="post"
          >
            <LoginForm searchParams={searchParams} />
          </form>
        </div>
      </div>
    </main>
  );
}
