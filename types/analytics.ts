// types/analytics.ts
// Responsibility: Types for career analytics and growth metrics.

export interface TrendDataPoint {
  month: string;
  value: number;
}

export interface SkillScore {
  name: string;
  value: number;
}

export interface CareerAnalytics {
  userId: string;
  readinessTrend: TrendDataPoint[];
  skillScores: SkillScore[];
  careerMomentum: SkillScore[];
  updatedAt: string;
}
