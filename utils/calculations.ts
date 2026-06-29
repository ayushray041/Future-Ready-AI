// utils/calculations.ts
// Responsibility: Pure functions for career score, readiness percentage,
// and other numeric computations. Keeps logic testable and side-effect free.

export function calculateCareerReadiness(metrics: {
  dsa: number;
  projects: number;
  github: number;
  communication: number;
}): number {
  const weights = { dsa: 0.3, projects: 0.3, github: 0.2, communication: 0.2 };
  return Math.round(
    metrics.dsa * weights.dsa +
    metrics.projects * weights.projects +
    metrics.github * weights.github +
    metrics.communication * weights.communication
  );
}

export function calculateMatchScore(
  userSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 0;
  const matched = userSkills.filter((s) => requiredSkills.includes(s));
  return Math.round((matched.length / requiredSkills.length) * 100);
}
