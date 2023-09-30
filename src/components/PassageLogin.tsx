"use client";
import { useEffect } from "react";

export const PassageLogin = () => {
  useEffect(() => {
    require("@passageidentity/passage-elements/passage-auth");
  }, []);

  return (
    <>
      {/* @ts-expect-error */}
      <passage-auth app-id={process.env.NEXT_PUBLIC_PASSAGE_APP_ID} />
    </>
  );
};
