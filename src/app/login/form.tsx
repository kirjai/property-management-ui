"use client";
import { useSearchParams } from "next/navigation";
import { Errors } from "./messages";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  useFormStatus;
  const message = searchParams.get("message");
  const { pending } = useFormStatus();

  return (
    <>
      {message ? (
        <div className="font-semibold text-center flex flex-col gap-2">
          <p className="text-xl">✅ ✉️ Login email sent</p>
          <p className="font-normal">{message}</p>
        </div>
      ) : (
        <>
          <div className="text-center font-semibold">
            <h1 className="text-xl">Welcome back</h1>
            <p>Let us get you signed in!</p>
          </div>

          <form
            className="flex flex-col gap-4"
            action="/auth/login"
            method="post"
          >
            <fieldset disabled={pending}>
              <div className="flex flex-col gap-1">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="border border-gray-400 rounded-xl p-4"
                  placeholder="example@email.com"
                />
              </div>
            </fieldset>

            <Errors />

            <button
              type="submit"
              disabled={pending}
              className="p-4 w-full text-white rounded-xl font-semibold shadow-md shadow-primary-dark bg-gradient-to-t from-primary-gradient-from to-primary"
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {!pending ? "Sign in" : "Signing you in..."}
            </button>
          </form>
        </>
      )}
    </>
  );
}
