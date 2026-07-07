// types/interview.ts
// Responsibility: Types for AI interview prep sessions and evaluation results.

export type InterviewCategoryId =
  | 'dsa'
  | 'system'
  | 'behavioral'
  | 'ml'
  | 'frontend'
  | 'hr';

export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  id: string;
  text: string;
  difficulty: InterviewDifficulty;
  hint: string;
  sampleAnswer: string;
  tags: string[];
}

export interface InterviewEvaluationRequest {
  uid: string;
  category: InterviewCategoryId;
  difficulty: InterviewDifficulty;
  question: string;
  userAnswer: string;
}

export interface InterviewEvaluationResult {
  score: number;
  verdict: 'Excellent' | 'Good' | 'Average' | 'Poor';

  feedback: string;

  strengths: string[];
  improvements: string[];
  missingPoints: string[];

  correctAnswer: string;

  // NEW FIELDS
  skillsAssessed: string[];
  followUpQuestion: string;
}

export interface InterviewSessionRecord
  extends InterviewEvaluationResult {
  uid: string;

  category: InterviewCategoryId;
  difficulty: InterviewDifficulty;

  question: string;
  userAnswer: string;

  createdAt: string;
}

export interface InterviewTrendPoint {
  date: string;
  score: number;
}

export interface InterviewAnalyticsStats {
  averageScore: number;
  highestScore: number;

  categoryWiseScore: Record<InterviewCategoryId, number>;

  totalQuestionsAnswered: number;

  improvementTrend: InterviewTrendPoint[];

  categoryCounts: Record<InterviewCategoryId, number>;
  categorySums: Record<InterviewCategoryId, number>;
}