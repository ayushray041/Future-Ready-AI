// utils/helpers.ts
// Responsibility: General-purpose utility functions that don't belong to a
// specific domain (string manipulation, array utils, date helpers, etc.)

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
