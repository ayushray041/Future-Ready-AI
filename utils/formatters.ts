// utils/formatters.ts
// Responsibility: Data display formatting — dates, numbers, percentages, names.
// Pure functions, zero side-effects.

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPercent(value: number): string {
  return `${Math.min(100, Math.max(0, value))}%`;
}

export function formatLPA(value: number): string {
  return `${value} LPA`;
}
