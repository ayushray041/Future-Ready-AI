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
  dsa:
    'Explain the optimal algorithm, time complexity, space complexity and edge cases in under 180 words.',

  system:
    'Explain architecture, scalability, bottlenecks and trade-offs in under 180 words.',

  behavioral:
    'Answer using the STAR method in under 150 words.',

  ml:
    'Explain the concept, evaluation metrics and practical trade-offs in under 180 words.',

  frontend:
    'Explain implementation, browser behaviour, optimization and performance in under 180 words.',

  hr:
    'Provide a professional HR interview answer in under 120 words.',
};

const SYSTEM_PROMPT = `
You are FutureReady AI, an expert technical interviewer and evaluator.

Evaluate ONLY the candidate's answer based on the given question.

Return ONLY a valid JSON object with this exact structure:

{
  "score": 0,
  "verdict": "Excellent",
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "missingPoints": [],
  "correctAnswer": "",
  "skillsAssessed": [],
  "followUpQuestion": ""
}
Evaluation Rules:

- Score must be between 0 and 100.
- Verdict mapping:
  - 90-100 = Excellent
  - 75-89 = Good
  - 50-74 = Average
  - 0-49 = Poor

- Feedback:
  - Maximum 80 words.
  - Mention strengths and weaknesses.

- Strengths:
  - Maximum 3 points.
  - Each point under 15 words.

- Improvements:
  - Maximum 3 actionable points.
  - Each point under 15 words.

- MissingPoints:
  - Maximum 5 short concepts.

  - skillsAssessed:
  Exactly 3 interview skills.

- followUpQuestion:
  Generate one relevant follow-up interview question.

- CorrectAnswer:
  - Maximum 80 words.
  - Explain only the ideal approach.
  - Mention time complexity only if applicable.
  - Do not include code.
  - Do not include pseudocode.
  - Use one concise paragraph.
  - skillsAssessed:
  - Exactly 3 interview skills.
  - Examples:
    - Problem Solving
    - Communication
    - Time Complexity
    - Data Structures
    - System Design
    - Debugging

- followUpQuestion:
  - Generate exactly ONE relevant follow-up interview question.
  - Maximum 20 words.

  Return EXACTLY:

- strengths -> exactly 3 items
- improvements -> exactly 3 items
- missingPoints -> exactly 3 items
- skillsAssessed -> exactly 3 items

Never repeat the original question.
Never repeat the student's answer.
Keep every response concise.

If the student's answer is very short, evaluate only what is present.
Do NOT expand or imagine missing information.

Never repeat the question.
Never repeat the student's answer.

If answer length < 5 characters

Return

score = 0

verdict = Poor

Do not generate CorrectAnswer longer than 40 words.

Return ONLY valid JSON.

No markdown.
No code fences.
No explanations.
`;

export function mapScoreToVerdict(score: number): InterviewEvaluationResult['verdict'] {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

function buildFallbackEvaluation(
  request: InterviewEvaluationRequest,
): InterviewEvaluationResult {
  const text = `${request.question} ${request.userAnswer}`.toLowerCase();
  const hasStructure = /(step|first|then|finally|because|therefore|however|while|for|if)/i.test(request.userAnswer);
  const hasSpecifics = /\b(algorithm|complexity|trade-off|scalability|latency|throughput|metrics|edge case|system design|star|situation|task|action|result)\b/i.test(request.userAnswer);
  const hasDepth = request.userAnswer.trim().split(/\s+/).length >= 20;

  const score = Math.min(
    100,
    Math.max(
      20,
      35 + (hasStructure ? 15 : 0) + (hasSpecifics ? 20 : 0) + (hasDepth ? 15 : 0) + (request.userAnswer.trim().length > 40 ? 10 : 0),
    ),
  );

  const verdict = mapScoreToVerdict(score);

  return {
    score,
    verdict,
    feedback:
      score >= 80
        ? 'Your answer is well structured and covers meaningful points. Add a bit more specificity to make it fully interview-ready.'
        : score >= 50
          ? 'Your answer shows a reasonable understanding, but it would benefit from clearer structure and more concrete details.'
          : 'Your answer is too brief or too general. Add a clearer framework, specific examples, and a stronger conclusion.',
    strengths:
      score >= 80
        ? ['Clear response structure', 'Relevant domain knowledge', 'Good overall clarity']
        : score >= 50
          ? ['Shows relevant understanding', 'Reasonable flow', 'Uses familiar concepts']
          : ['Attempted an answer', 'Shows some awareness', 'Understands the topic'],
    improvements:
      score >= 80
        ? ['Add one concrete example', 'Mention trade-offs clearly', 'Close with a stronger takeaway']
        : score >= 50
          ? ['Use a clearer structure', 'Be more specific', 'Include one outcome or metric']
          : ['Organize the answer', 'Add concrete details', 'Mention the main takeaway'],
    missingPoints: ['Key technical details', 'Practical trade-offs', 'Concrete outcome or example'],
    correctAnswer:
      request.category === 'behavioral'
        ? 'Use the STAR format and clearly explain the situation, task, action, and result.'
        : 'Explain the core approach first, then mention trade-offs, constraints, and the most important takeaway.',
    skillsAssessed: ['Communication', 'Problem Solving', 'Clarity'],
    followUpQuestion: 'Can you explain your approach in one sentence with a concrete example?',
  };
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

  let evaluation: InterviewEvaluationResult;

  try {
    evaluation = await geminiJSON<InterviewEvaluationResult>(
      SYSTEM_PROMPT,
      userPrompt,
      {
        temperature: 0.15,
        maxTokens: 1800,
      }
    );
  } catch (err) {
    console.warn('[interview.service] Gemini unavailable, using fallback evaluation', err);
    evaluation = buildFallbackEvaluation(request);
  }

  // Validate score
  if (typeof evaluation.score !== "number") {
  throw new Error("Gemini returned an invalid score.");
}

// Keep score between 0-100
evaluation.score = Math.max(0, Math.min(100, Math.round(evaluation.score)));

// Always calculate verdict ourselves
evaluation.verdict = mapScoreToVerdict(evaluation.score);

// Prevent null arrays
evaluation.strengths = Array.isArray(evaluation.strengths)
  ? evaluation.strengths.slice(0, 3)
  : [];

evaluation.improvements = Array.isArray(evaluation.improvements)
  ? evaluation.improvements.slice(0, 3)
  : [];

evaluation.missingPoints = Array.isArray(evaluation.missingPoints)
  ? evaluation.missingPoints.slice(0, 3)
  : [];

// NEW FIELD
evaluation.skillsAssessed = Array.isArray(evaluation.skillsAssessed)
  ? evaluation.skillsAssessed.slice(0, 3)
  : [];

// Prevent missing strings
evaluation.feedback =
  typeof evaluation.feedback === "string"
    ? evaluation.feedback.trim()
    : "";

evaluation.correctAnswer =
  typeof evaluation.correctAnswer === "string"
    ? evaluation.correctAnswer.trim()
    : "";

// NEW FIELD
evaluation.followUpQuestion =
  typeof evaluation.followUpQuestion === "string"
    ? evaluation.followUpQuestion.trim()
    : "";

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