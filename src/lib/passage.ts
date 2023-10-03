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

  try {
    const userId = await passage.validAuthToken(passageAuthToken.value);

    if (!userId)
      return {
        isAuthorized: false as const,
      };

    return {
      isAuthorized: true as const,
      userId,
    };
  } catch (error) {
    console.warn("Error while validating auth token", error);
    const passageRefreshToken = cookies().get("psg_refresh_token");
    if (!passageRefreshToken) {
      console.error("No refresh token found");
      return {
        isAuthorized: false as const,
      };
    }
    try {
      const { auth_token, refresh_token, refresh_token_expiration } =
        await refreshPassageAuthToken(passageRefreshToken.value);
      const userId = await passage.validAuthToken(auth_token);

      if (!userId)
        return {
          isAuthorized: false as const,
        };

      return {
        isAuthorized: true as const,
        userId,
        newAuthToken: auth_token,
        newRefreshToken: refresh_token,
        refreshTokenExpiration: refresh_token_expiration,
      };
    } catch (error2) {
      console.error("Error while refreshing auth token", error2);
      return {
        isAuthorized: false as const,
      };
    }
  }
};

const url = "https://auth.passage.id";

type PassageAuthResponse = {
  auth_result: {
    auth_token: string;
    refresh_token: string;
    refresh_token_expiration: number;
  };
};
const refreshPassageAuthToken = async (refreshToken: string) => {
  const appId = process.env.NEXT_PUBLIC_PASSAGE_APP_ID!;

  const response = await fetch(`${url}/v1/apps/${appId}/tokens/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  const { auth_result } = data as PassageAuthResponse;
  return auth_result;
};
