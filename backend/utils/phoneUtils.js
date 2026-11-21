// Normalize phone to +91 format
export const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "";
  return `+91${digits}`;
};
