// types/resume.ts
// Responsibility: Types for resume analysis and scoring.

export interface ResumeSection {
  title: string;
  score: number;
  feedback: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  overallScore: number;
  sections: ResumeSection[];
  suggestions: string[];
  analyzedAt: string;
}
