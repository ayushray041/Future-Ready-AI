// utils/validators.ts
// Responsibility: Input validation functions for forms and API payloads.
// Returns boolean or an error message string.

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
