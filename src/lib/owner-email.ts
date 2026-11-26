export function isAllowedOwnerEmail(email?: string | null): boolean {
  const ownerEmail = process.env.OWNER_EMAIL_ADDRESS?.trim().toLowerCase();
  if (!ownerEmail || !email) return false;
  return email.trim().toLowerCase() === ownerEmail;
}
