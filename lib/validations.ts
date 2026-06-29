// lib/validations.ts
// Responsibility: Schema-level validation for API request bodies.
// Uses zod (or native checks) to validate before hitting services.

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
