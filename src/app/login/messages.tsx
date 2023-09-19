"use client";
import { useSearchParams } from "next/navigation";

export const Success = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <>
      {message ? (
        <div className="font-semibold text-center flex flex-col gap-2">
          <p className="text-xl">✅ ✉️ Login email sent</p>
          <p className="font-normal">{message}</p>
        </div>
      ) : null}
    </>
  );
};

export const Errors = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {error ? (
        <p className="text-red-700 flex flex-col">
          <span className="font-medium">
            There's been a problem signing you in. Please try again.
          </span>
          <span>{error}</span>
        </p>
      ) : null}
    </>
  );
};
