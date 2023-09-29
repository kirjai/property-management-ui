import type { ErrorTag, MessageTag } from "../../api/auth/login/route";
import { useTranslations } from "next-intl";
import { SubmitButton } from "./submit-button";

export const LoginForm = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations<"Login">("Login");
  const message = searchParams.message as MessageTag | null;

  if (message && message === "success")
    return (
      <div className="font-semibold text-center flex flex-col gap-2">
        <p className="text-xl">{t("login-email-sent")}</p>
        <p className="font-normal">
          {t(
            "please-check-your-email-and-click-the-login-link-in-the-email-to-continue"
          )}
        </p>
      </div>
    );

  return (
    <>
      <div className="text-center font-semibold">
        <h1 className="text-xl">{t("welcome-back")}</h1>
        <p>{t("let-us-get-you-signed-in")}</p>
      </div>

      <div className="flex flex-col gap-4">
        <fieldset>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">{t("email")}</label>
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

        <Errors searchParams={searchParams} />

        <SubmitButton
          messages={{
            signIn: t("sign-in"),
            signingIn: t("signing-you-in"),
          }}
        />
      </div>
    </>
  );
};

export const Errors = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations("Login");
  const error = searchParams.error as ErrorTag | null;

  return (
    <>
      {error ? (
        <p className="text-red-700 flex flex-col">
          <span className="font-medium">
            {t("sorry-we-couldn-and-rsquo-t-sign-you-in-at-this-time")}
          </span>
          {error === "signup" ? (
            <span>
              {t(
                "email-address-not-recognized-if-you-think-this-is-a-mistake-please-check-the-email-address-and-try-again"
              )}
            </span>
          ) : null}
          {error === "generic" && searchParams.error_message ? (
            <span>{searchParams.error_message}</span>
          ) : null}
        </p>
      ) : null}
    </>
  );
};
