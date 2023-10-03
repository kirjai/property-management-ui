import * as S from "@effect/schema/Schema";
import { cookies } from "next/headers";

const Body = S.struct({
  refreshToken: S.string.pipe(S.nonEmpty()),
  authToken: S.union(S.string, S.null),
  refreshTokenExpiration: S.union(S.number, S.null),
});

const parseBody = S.parseEither(Body);

export const POST = async (request: Request) => {
  const data = await request.json();

  const maybeBody = parseBody(data);

  if (maybeBody._tag === "Left")
    return new Response(JSON.stringify(maybeBody.left), { status: 400 });

  const { refreshToken, refreshTokenExpiration } = maybeBody.right;

  cookies().set("psg_refresh_token", refreshToken, {
    // 1 year
    expires:
      refreshTokenExpiration ??
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  if (maybeBody.right.authToken) {
    cookies().set("psg_auth_token", maybeBody.right.authToken);
  }

  return new Response(JSON.stringify({}), { status: 200 });
};
