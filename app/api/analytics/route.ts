// app/api/analytics/route.ts
// Receives the user's real analytics snapshot, generates 4 personalised
// AI insights via Gemini. Returns { insights: AiInsight[] }.

import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/gemini';
import type { AiInsight } from '@/types';

export const runtime = 'nodejs';

const SYSTEM = `You are a data-driven career analytics AI. Given a student's real career metrics, generate 4 concise, personalised insights.

RULES FOR EACH INSIGHT:
1. Reference at least one specific number from the data (score, count, percentage)
2. Explain what that metric means for the student's career trajectory
3. End with one concrete action they can take in the next 7 days
4. No generic coaching platitudes — be specific and honest

Tone: direct, encouraging, evidence-based. Like a senior engineer mentoring a junior.`;

interface AnalyticsRequest {
  careerScore:   number;
  targetScore:   number;
  streak:        number;
  skillScores:   { skill: string; score: number }[];
  applications:  { month: string; applied: number; interviews: number }[];
  interviewPerf: { round: string; score: number }[];
  targetCareer:  string;
  year:          string;
}

export async function POST(req: NextRequest) {
  try {
    const data: AnalyticsRequest = await req.json();

    const weakestSkill = [...(data.skillScores ?? [])]
      .sort((a, b) => a.score - b.score)[0];

    const totalApplied     = data.applications?.reduce((s, a) => s + a.applied,    0) ?? 0;
    const totalInterviews  = data.applications?.reduce((s, a) => s + a.interviews, 0) ?? 0;
    const conversionRate   = totalApplied > 0
      ? Math.round((totalInterviews / totalApplied) * 100)
      : 0;

    const userPrompt = `STUDENT ANALYTICS:
- Career Score: ${data.careerScore}/100 (target: ${data.targetScore})
- Target Career: ${data.targetCareer}
- Academic Year: ${data.year}
- Active Streak: ${data.streak} days
- Weakest Skill: ${weakestSkill?.skill ?? 'unknown'} (${weakestSkill?.score ?? 0}/100)
- All Skill Scores: ${JSON.stringify(data.skillScores ?? [])}
- Total Applications: ${totalApplied}
- Total Interviews: ${totalInterviews}
- Interview Conversion Rate: ${conversionRate}%
- Applications by Month: ${JSON.stringify(data.applications ?? [])}
- Interview Performance: ${JSON.stringify(data.interviewPerf ?? [])}

Return EXACTLY this JSON:
{
  "insights": [
    { "emoji": "<emoji>", "title": "<5–7 word bold title>", "body": "<2–3 sentences. Must include at least one specific number. End with a concrete 7-day action.>" },
    { "emoji": "<emoji>", "title": "<5–7 word bold title>", "body": "<2–3 sentences specific insight>" },
    { "emoji": "<emoji>", "title": "<5–7 word bold title>", "body": "<2–3 sentences specific insight>" },
    { "emoji": "<emoji>", "title": "<5–7 word bold title>", "body": "<2–3 sentences specific insight>" }
  ]
}`;

    const result = await geminiJSON<{ insights: AiInsight[] }>(SYSTEM, userPrompt, {
      temperature: 0.6,
      maxTokens:   1024,
    });

    return NextResponse.json({ insights: result.insights ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Analytics insights generation failed';
    console.error('[POST /api/analytics]', err);
    return NextResponse.json({ error: msg, insights: [] }, { status: 500 });
  }
}