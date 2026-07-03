// app/api/career-twin/route.ts
// Receives student profile + optional resume analysis.
// Calls Gemini to generate a full CareerTwin report:
//   - Digital twin identity
//   - Skill gap analysis
//   - Future role predictions
//   - Personalised recommendations
//   - Quarter-by-quarter growth plan

import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/gemini';
import type { CareerTwinData } from '@/types';

export const runtime = 'nodejs';

const SYSTEM = `You are an advanced career trajectory AI trained on thousands of anonymised engineering student career paths in India. You specialise in generating realistic, data-driven Career Twin reports for students targeting top tech roles.

A Career Twin is the median successful student who reached the same target role starting from a similar background. All data must be realistic and calibrated to the current Indian tech job market (FAANG India, unicorn startups like Zepto/CRED/Meesho, product companies like Atlassian/Freshworks).

RULES:
- Be specific, honest, and evidence-based — no inflated numbers
- Skill scores must reflect genuine industry benchmarks (most 2nd-year students score 45–70 in most areas)
- Probabilities for FAANG roles should be conservative (15–40%) unless the profile is exceptional
- Recommendations must directly reference the gap between "you" and "twin" data points
- The growth plan must be quarterly and role-specific`;

type TwinPayload = Omit<CareerTwinData, 'id' | 'uid' | 'generatedAt'>;

interface RequestBody {
  uid: string;
  profile: {
    displayName:       string;
    year:              string;
    branch:            string;
    college:           string;
    targetCareer:      string;
    skills:            string[];
    goals:             string[];
    salaryExpectation: string;
  };
  resumeAnalysis: {
    overallScore:    number;
    extractedSkills: string[];
    missingSkills:   string[];
  } | null;
}

export async function POST(req: NextRequest) {
  try {
    const { uid, profile, resumeAnalysis }: RequestBody = await req.json();

    if (!uid || !profile) {
      return NextResponse.json({ error: 'uid and profile are required' }, { status: 400 });
    }

    const resumeBlock = resumeAnalysis
      ? `\nRESUME ANALYSIS:\n- Resume Score: ${resumeAnalysis.overallScore}/100\n- Skills in resume: ${resumeAnalysis.extractedSkills.join(', ')}\n- Missing skills: ${resumeAnalysis.missingSkills.join(', ')}`
      : '';

    const userPrompt = `STUDENT PROFILE:
Name: ${profile.displayName}
Year: ${profile.year}
Branch: ${profile.branch}
College: ${profile.college}
Target Career: ${profile.targetCareer}
Current Skills: ${profile.skills.join(', ')}
Career Goals: ${profile.goals.join(', ')}
Salary Expectation: ${profile.salaryExpectation}${resumeBlock}

Generate a Career Twin report. Return EXACTLY this JSON (no extra text):
{
  "twinId": "A-<random 4-digit number>",
  "matchPercent": <85–96>,
  "twinBackground": "<1-sentence description, e.g. 'CSE, 2nd year at NIT Surathkal with similar skill set'>",
  "twinRole": "<specific current role at a real company type, e.g. 'ML Engineer at Meesho'>",
  "twinScore": <88–96>,
  "successFactors": "<2–3 specific actions the twin took that differentiated them from peers>",
  "skillGap": [
    { "skill": "<skill name>", "you": <realistic 0–100 score for this student>, "twin": <realistic 0–100 target score>, "gap": <you minus twin, negative means behind> }
  ],
  "futureRoles": [
    { "title": "<role>", "company": "<company type>", "probability": <realistic 20–90>, "salary": "<X–Y LPA>", "timeline": "<e.g. 18 months>", "match": "<high|medium|low>" }
  ],
  "recommendations": [
    { "priority": 1, "emoji": "<emoji>", "title": "<specific 5-7 word action>", "impact": "+<N> pts", "effort": "<N weeks>", "desc": "<2 sentences referencing the twin's journey and this student's specific gap>" }
  ],
  "growthPlan": "<3–4 sentence paragraph describing the Q1→Q2→Q3→Q4 journey to the target role, specific to this student's current gaps>"
}

Include 6–8 skillGap items, 4–5 futureRoles, and exactly 4 recommendations.`;

    const twin = await geminiJSON<TwinPayload>(SYSTEM, userPrompt, {
      temperature: 0.5,
      maxTokens:   4096,
    });

    return NextResponse.json({
      twin: {
        uid,
        generatedAt: new Date().toISOString(),
        ...twin,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Career Twin generation failed';
    console.error('[POST /api/career-twin]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}