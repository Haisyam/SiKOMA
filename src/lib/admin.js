const parseEmails = (value) =>
  value
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [];

export const getAdminEmails = () => parseEmails(import.meta.env.VITE_ADMIN_EMAILS ?? "");

export const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
};
