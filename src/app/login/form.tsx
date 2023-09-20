"use client";
import { useSearchParams } from "next/navigation";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ErrorTag, MessageTag } from "../auth/login/route";

export const LoginForm = () => {
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") as MessageTag | null;

  if (message && message === "success")
    return (
      <div className="font-semibold text-center flex flex-col gap-2">
        <p className="text-xl">✅ ✉️ Login email sent</p>
        <p className="font-normal">
          Please check your email and click the login link in the email to
          continue.
        </p>
      </div>
    );

  return (
    <>
      <div className="text-center font-semibold">
        <h1 className="text-xl">Welcome back</h1>
        <p>Let us get you signed in!</p>
      </div>

      <div>
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
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {!pending ? "Sign in" : "Signing you in..."}
        </button>
      </div>
    </>
  );
};

export const Errors = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as ErrorTag | null;

  return (
    <>
      {error ? (
        <p className="text-red-700 flex flex-col">
          <span className="font-medium">
            Sorry, we couldn&rsquo;t sign you in at this time.
          </span>
          {error === "signup" ? (
            <span>
              Email address not recognized. If you think this is a mistake -
              please check the email address and try again.
            </span>
          ) : null}
          {error === "generic" && searchParams.get("error_message") ? (
            <span>{searchParams.get("error_message")}</span>
          ) : null}
        </p>
      ) : null}
    </>
  );
};
