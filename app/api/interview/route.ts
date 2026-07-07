import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateInterviewAnswer,
  persistInterviewEvaluation,
  updateInterviewAnalytics,
} from '@/services/interview.service';

import type {
  InterviewEvaluationRequest,
  InterviewSessionRecord,
} from '@/types/interview';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      uid: string;
      category: string;
      difficulty: string;
      question: string;
      userAnswer: string;
    };

    const { uid, category, difficulty, question, userAnswer } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'uid is required' },
        { status: 400 }
      );
    }

    if (!category || !question || !userAnswer) {
      return NextResponse.json(
        {
          error: 'category, question, and userAnswer are required',
        },
        { status: 400 }
      );
    }

    const request: InterviewEvaluationRequest = {
      uid,
      category: category as InterviewEvaluationRequest['category'],
      difficulty: difficulty as InterviewEvaluationRequest['difficulty'],
      question,
      userAnswer,
    };

    const evaluation = await evaluateInterviewAnswer(request);

    const record: InterviewSessionRecord = {
  uid,
  category: request.category,
  difficulty: request.difficulty,

  question,
  userAnswer,

  score: evaluation.score,
  verdict: evaluation.verdict,

  feedback: evaluation.feedback,

  strengths: evaluation.strengths,
  improvements: evaluation.improvements,
  missingPoints: evaluation.missingPoints,

  correctAnswer: evaluation.correctAnswer,

  // NEW FIELDS
  skillsAssessed: evaluation.skillsAssessed,
  followUpQuestion: evaluation.followUpQuestion,

  createdAt: new Date().toISOString(),
};

    await persistInterviewEvaluation(record);
    await updateInterviewAnalytics(
      uid,
      request.category,
      evaluation.score
    );

    return NextResponse.json({
      evaluation,
      saved: true,
    });
  } catch (err) {
    console.error('[POST /api/interview]', err);

    const message =
      err instanceof Error
        ? err.message
        : 'Interview evaluation failed';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}