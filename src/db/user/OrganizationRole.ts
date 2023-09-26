import * as S from "@effect/schema/Schema";

export const OrganizationRole = S.union(
  S.literal("admin"),
  S.literal("cleaner")
);
export type OrganizationRole = S.Schema.To<typeof OrganizationRole>;
