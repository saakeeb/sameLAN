/**
 * Generates a short, human-readable alphanumeric identifier.
 * Excludes ambiguous characters (0, O, I, 1) to make it easier to read and share.
 */
export const generateId = (length: number = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
