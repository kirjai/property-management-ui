import Passage from "@passageidentity/passage-node";
import { cookies } from "next/headers";

const passage = new Passage({
  appID: process.env.NEXT_PUBLIC_PASSAGE_APP_ID!,
  apiKey: process.env.PASSAGE_API_KEY!,
});

export const getAuthenticatedUserFromSession = async () => {
  const passageAuthToken = cookies().get("psg_auth_token");

  if (!passageAuthToken)
    return {
      isAuthorized: false as const,
    };

  const userId = await passage.validAuthToken(passageAuthToken.value);

  if (!userId)
    return {
      isAuthorized: false as const,
    };

  return {
    isAuthorized: true as const,
    userId,
  };
};
