import { z } from "zod";
import { isDayKey } from "./season";

// A roster row's details, as the coach types them: shirt number, birth date,
// CURP and two guardians. Shared by adding a player and editing one, so both
// accept and refuse the same things. Empty strings clear a field.

const text = (max: number) => z.string().trim().max(max).optional();

export const rosterDetailFields = {
  number: z.union([z.number().int().min(0).max(999), z.null()]).optional(),
  birthDate: z.union([z.string().refine(isDayKey, "pickDate"), z.literal("")]).optional(),
  curp: z.union([z.string().trim().toUpperCase().regex(/^[A-Z0-9]{18}$/, "curp"), z.literal("")]).optional(),
  guardian1Name: text(80),
  guardian1Email: z.union([z.string().trim().email("checkEmail").max(120), z.literal("")]).optional(),
  guardian1Phone: text(40),
  guardian2Name: text(80),
  guardian2Email: z.union([z.string().trim().email("checkEmail").max(120), z.literal("")]).optional(),
  guardian2Phone: text(40),
};

/** The parsed details as database values: blanks become null, absent stays absent. */
export function rosterDetailData(fields: Record<string, string | number | null | undefined>) {
  const data: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) data[k] = v === "" ? null : v;
  return data;
}
