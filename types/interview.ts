// types/interview.ts
// Responsibility: Types for AI interview prep sessions.

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewType = 'technical' | 'behavioral' | 'hr';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  difficulty: QuestionDifficulty;
  type: InterviewType;
  topic: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  questions: InterviewQuestion[];
  score?: number;
  completedAt?: string;
  createdAt: string;
}
