/** Normalize email for storage and lookup (lowercase, trim). */
export function normalizeCourseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeCourseEmail(email));
}
