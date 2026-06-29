// types/index.ts — single source of truth for all shared TypeScript types

// ── User & Auth ──────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  college: string;
  year: string;
  branch: string;
  targetCareer: string;
  salaryExpectation: string;
  skills: string[];
  goals: string[];
  careerScore: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

// ── Mentor ───────────────────────────────────────────────────
export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MentorSession {
  id: string;
  uid: string;
  messages: MentorMessage[];
  createdAt: string;
  updatedAt: string;
}

// ── Resume ───────────────────────────────────────────────────
export type SectionStatus = 'good' | 'ok' | 'bad';

export interface ResumeSection {
  label: string;
  score: number;
  feedback: string;
  status: SectionStatus;
}

export interface ResumeAnalysis {
  id: string;
  uid: string;
  fileName: string;
  rawText: string;
  overallScore: number;
  atsScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  sections: ResumeSection[];
  suggestions: string[];
  analyzedAt: string;
}

// ── Career Twin ──────────────────────────────────────────────
export interface SkillGapItem {
  skill: string;
  you: number;
  twin: number;
  gap: number;
}

export interface FutureRole {
  title: string;
  company: string;
  probability: number;
  salary: string;
  timeline: string;
  match: 'high' | 'medium' | 'low';
}

export interface TwinRecommendation {
  priority: number;
  emoji: string;
  title: string;
  impact: string;
  effort: string;
  desc: string;
}

export interface CareerTwinData {
  id: string;
  uid: string;
  twinId: string;
  matchPercent: number;
  twinBackground: string;
  twinRole: string;
  twinScore: number;
  successFactors: string;
  skillGap: SkillGapItem[];
  futureRoles: FutureRole[];
  recommendations: TwinRecommendation[];
  growthPlan: string;
  generatedAt: string;
}

// ── Analytics ────────────────────────────────────────────────
export interface TrendPoint {
  month: string;
  score: number;
  target: number;
  peer: number;
}

export interface ApplicationRecord {
  month: string;
  applied: number;
  interviews: number;
}

export interface InterviewPerf {
  round: string;
  score: number;
}

export interface AiInsight {
  emoji: string;
  title: string;
  body: string;
}

export interface AnalyticsData {
  uid: string;
  careerScore: number;
  careerTrend: TrendPoint[];
  skillScores: { skill: string; score: number }[];
  applications: ApplicationRecord[];
  interviewPerf: InterviewPerf[];
  insights: AiInsight[];
  updatedAt: string;
}