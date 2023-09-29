"use client";
import { Loader2 } from "lucide-react";
import { experimental_useFormStatus } from "react-dom";

export const SubmitButton = ({
  messages: { signIn, signingIn },
}: {
  messages: { signIn: string; signingIn: string };
}) => {
  const { pending } = experimental_useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="p-4 w-full text-white rounded-xl font-semibold shadow-md shadow-primary-dark bg-gradient-to-t from-primary-gradient-from to-primary"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {!pending ? <>{signIn}</> : <>{signingIn}</>}
    </button>
  );
};
