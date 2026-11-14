import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize an email as the user types it: strip accents/tildes down to base
 * letters, remove all whitespace and lowercase the value. Use it in the
 * onChange of email inputs so users cannot enter characters that don't belong
 * in an email (spaces, uppercase, diacritics).
 */
export function sanitizeEmailInput(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}
