import { geminiJSON } from '@/lib/gemini';
import { fsAddAdmin } from '@/services/firestore-admin.service';
import {
  getAnalyticsAdmin,
  upsertAnalyticsAdmin,
} from '@/services/analytics-admin.service';
import type {
  InterviewAnalyticsStats,
  InterviewCategoryId,
  InterviewEvaluationRequest,
  InterviewEvaluationResult,
  InterviewSessionRecord,
} from '@/types/interview';

const CATEGORY_ANSWER_STYLE: Record<InterviewCategoryId, string> = {
  dsa: 'an optimal algorithm explanation that describes the algorithm, complexity, edge cases, and trade-offs.',
  system: 'an architecture-level design answer that covers major components, data flow, scaling, availability, and trade-offs.',
  behavioral: 'a STAR-style answer that highlights Situation, Task, Action, and Result with measurable outcomes.',
  ml: 'a conceptually correct explanation that covers model behavior, evaluation, metrics, and practical trade-offs.',
  frontend: 'a technically correct implementation answer that includes framework behavior, performance, and practical constraints.',
  hr: 'a professional interview answer that demonstrates motivation, culture fit, and a growth mindset.',
};

const SYSTEM_PROMPT = `You are a trusted interview evaluator for FutureReady AI. Evaluate the candidate's answer using the actual question and the answer the candidate provided. Do not assume facts not present in the answer. Be honest, specific, and generate a concise, high-quality response.

Return EXACTLY this JSON object and nothing else:
{
  "score": <number 0-100>,
  "verdict": "Excellent" | "Good" | "Average" | "Poor",
  "feedback": "<one paragraph summary of strengths and weaknesses>",
  "strengths": ["<positive point 1>", "<positive point 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "missingPoints": ["<important concept or detail missing from the answer>", "<additional missing point>"],
  "correctAnswer": "<AI generated ideal answer in the appropriate interview style>"
}

Evaluation rules:
- Score must be based on answer quality, completeness, technical accuracy, and relevance.
- Use the category style guidance below to produce the model answer.
- Do not fabricate a score or review unrelated topics.
- Use the exact verdict mapping: 90-100 Excellent, 75-89 Good, 50-74 Average, below 50 Poor.
- All string values must be valid JSON strings. Escape any line breaks or special characters as needed.
- Do not wrap the response in markdown, code fences, or extraneous text.
`;

function buildPrompt(request: InterviewEvaluationRequest) {
  return `${SYSTEM_PROMPT}

CATEGORY: ${request.category}
DIFFICULTY: ${request.difficulty}
QUESTION: ${request.question}
STUDENT ANSWER: ${request.userAnswer}
ANSWER STYLE: ${CATEGORY_ANSWER_STYLE[request.category]}

Return valid JSON only.`;
}

export function mapScoreToVerdict(score: number): InterviewEvaluationResult['verdict'] {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

export async function evaluateInterviewAnswer(
  request: InterviewEvaluationRequest,
): Promise<InterviewEvaluationResult> {
  const userPrompt = `CATEGORY: ${request.category}
DIFFICULTY: ${request.difficulty}
QUESTION: ${request.question}
STUDENT ANSWER: ${request.userAnswer}
ANSWER STYLE: ${CATEGORY_ANSWER_STYLE[request.category]}

Return valid JSON only.`;

  const evaluation = await geminiJSON<InterviewEvaluationResult>(
  SYSTEM_PROMPT,
  userPrompt,
  {
    temperature: 0.2,
    maxTokens: 3000,
  }
);

  if (
    typeof evaluation.score !== 'number' ||
    !['Excellent', 'Good', 'Average', 'Poor'].includes(evaluation.verdict) ||
    !Array.isArray(evaluation.strengths) ||
    !Array.isArray(evaluation.improvements) ||
    !Array.isArray(evaluation.missingPoints) ||
    typeof evaluation.feedback !== 'string' ||
    typeof evaluation.correctAnswer !== 'string'
  ) {
    throw new Error('Gemini returned an invalid interview evaluation');
  }

  return evaluation;
}

export async function persistInterviewEvaluation(
  record: InterviewSessionRecord,
): Promise<string> {
  return fsAddAdmin('interview_sessions', record);
}

export async function updateInterviewAnalytics(
  uid: string,
  category: InterviewCategoryId,
  score: number,
): Promise<InterviewAnalyticsStats> {
  const existing = await getAnalyticsAdmin(uid);
  const previous = existing?.interviewStats;

  const totalQuestionsAnswered = (previous?.totalQuestionsAnswered ?? 0) + 1;
  const previousSum = (previous?.averageScore ?? 0) * (previous?.totalQuestionsAnswered ?? 0);
  const averageScore = Math.round((previousSum + score) / totalQuestionsAnswered);
  const highestScore = Math.max(previous?.highestScore ?? 0, score);

  const categoryCounts: Record<InterviewCategoryId, number> = {
  dsa: previous?.categoryCounts?.dsa ?? 0,
  system: previous?.categoryCounts?.system ?? 0,
  behavioral: previous?.categoryCounts?.behavioral ?? 0,
  ml: previous?.categoryCounts?.ml ?? 0,
  frontend: previous?.categoryCounts?.frontend ?? 0,
  hr: previous?.categoryCounts?.hr ?? 0,
};

categoryCounts[category]++;

const categorySums: Record<InterviewCategoryId, number> = {
  dsa: previous?.categorySums?.dsa ?? 0,
  system: previous?.categorySums?.system ?? 0,
  behavioral: previous?.categorySums?.behavioral ?? 0,
  ml: previous?.categorySums?.ml ?? 0,
  frontend: previous?.categorySums?.frontend ?? 0,
  hr: previous?.categorySums?.hr ?? 0,
};

categorySums[category] += score;

const categoryWiseScore: Record<InterviewCategoryId, number> = {
  dsa: Math.round(categorySums.dsa / Math.max(categoryCounts.dsa, 1)),
  system: Math.round(categorySums.system / Math.max(categoryCounts.system, 1)),
  behavioral: Math.round(
    categorySums.behavioral / Math.max(categoryCounts.behavioral, 1)
  ),
  ml: Math.round(categorySums.ml / Math.max(categoryCounts.ml, 1)),
  frontend: Math.round(
    categorySums.frontend / Math.max(categoryCounts.frontend, 1)
  ),
  hr: Math.round(categorySums.hr / Math.max(categoryCounts.hr, 1)),
};

  const improvementTrend = [...(previous?.improvementTrend ?? [])];
  const newPoint = { date: new Date().toISOString().slice(0, 10), score: averageScore };
  if (improvementTrend.length === 0 || improvementTrend[improvementTrend.length - 1].date !== newPoint.date) {
    improvementTrend.push(newPoint);
  } else {
    improvementTrend[improvementTrend.length - 1] = newPoint;
  }
  if (improvementTrend.length > 12) improvementTrend.shift();

  const nextStats: InterviewAnalyticsStats = {
    averageScore,
    highestScore,
    categoryWiseScore,
    totalQuestionsAnswered,
    improvementTrend,
    categoryCounts,
    categorySums,
  };

  await upsertAnalyticsAdmin(uid, {
  interviewStats: nextStats,
});
return nextStats;
}