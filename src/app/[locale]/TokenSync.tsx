"use client";

import { useEffect } from "react";

const sync = ({
  refreshToken,
  authToken,
  refreshTokenExpiration,
}: {
  refreshToken: string;
  authToken?: string;
  refreshTokenExpiration?: number;
}) => {
  return fetch("/api/token-sync", {
    method: "post",
    body: JSON.stringify({
      refreshToken,
      authToken: authToken ?? null,
      refreshTokenExpiration: refreshTokenExpiration ?? null,
    }),
  }).catch((error) => {
    console.error("Failed to sync token", error);
  });
};

export const TokenSync = ({
  refreshToken,
  refreshTokenExpiration,
  authToken,
}: {
  refreshToken?: string;
  authToken?: string;
  refreshTokenExpiration?: number;
}) => {
  useEffect(() => {
    const handler = () => {
      console.debug("STORAGE EVENT");
      const refreshToken = window.localStorage.getItem("psg_refresh_token");

      if (typeof refreshToken === "string" && refreshToken.length > 0) {
        sync({ refreshToken });
      }
    };

    if (typeof window !== "undefined" && window) {
      window.addEventListener("storage", handler);
    }

    return () => {
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window) {
      if (!refreshToken) {
        const localStorageRefreshToken =
          window.localStorage.getItem("psg_refresh_token");

        if (
          typeof localStorageRefreshToken === "string" &&
          localStorageRefreshToken.length > 0
        ) {
          console.debug("SYNCING LOCAL STORAGE TOKEN");
          sync({ refreshToken: localStorageRefreshToken });
        }
      } else if (refreshToken) {
        console.debug("SYNCING GIVEN TOKENS");
        sync({ refreshToken, authToken, refreshTokenExpiration });
      }
    }
  }, [refreshToken, authToken, refreshTokenExpiration]);

  return null;
};
