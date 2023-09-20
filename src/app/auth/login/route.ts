import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as S from "@effect/schema/Schema";
import * as E from "@effect/data/Either";
import { formatErrors } from "@effect/schema/TreeFormatter";

const FormValues = S.struct({
  email: S.string.pipe(S.nonEmpty()),
});

const parse = S.parseEither(FormValues);

export type ErrorTag = "signup" | "generic";
export type MessageTag = "success";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const supabase = createRouteHandlerClient({ cookies });

  const parsed = parse({
    email: formData.get("email"),
  });

  if (E.isLeft(parsed))
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${formatErrors(parsed.left.errors)}`,
      {
        status: 301,
      }
    );

  const { data, error } = await supabase.auth.signInWithOtp({
    email: parsed.right.email,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    const errorTag: ErrorTag =
      error.message === "Signups not allowed for this instance"
        ? "signup"
        : "generic";

    const sp = new URLSearchParams();
    sp.append("error", errorTag);
    if (errorTag === "generic") sp.append("error_message", error.message);

    return NextResponse.redirect(
      `${requestUrl.origin}/login?${sp.toString()}`,
      {
        status: 301,
      }
    );
  }

  const message: MessageTag = "success";
  const sp = new URLSearchParams();
  sp.append("message", message);

  return NextResponse.redirect(`${requestUrl.origin}/login?${sp.toString()}`, {
    status: 301,
  });
}
