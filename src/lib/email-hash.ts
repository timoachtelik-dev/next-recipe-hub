import { createHash } from "crypto";

const EMAIL_HASH_PEPPER = process.env.EMAIL_HASH_PEPPER || "";

export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(`${normalized}${EMAIL_HASH_PEPPER}`).digest("hex");
}
