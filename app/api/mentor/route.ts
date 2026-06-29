// app/api/mentor/route.ts
// Accepts { message, history, profile } from the client.
// Builds a personalised system prompt, calls Gemini 1.5 Flash,
// and returns { reply }.

import { NextRequest, NextResponse } from 'next/server';
import { geminiChat, type GeminiContent } from '@/lib/gemini';

export const runtime = 'nodejs';

const SYSTEM_BASE = `You are FutureReady AI Mentor — a warm, expert career guidance AI for Indian engineering students targeting top tech companies (Google, Microsoft, Meta, Amazon, Flipkart, Zepto, unicorn startups, etc.).

PERSONA & RULES:
- Always personalised: reference the student's specific profile, year, skills, and target role
- Evidence-based: cite concrete resources (LeetCode, Codeforces, Coursera, specific certifications)
- Actionable: every response must end with 1–3 numbered next steps the student can take today
- Concise but complete: use **bold** for key terms, bullet points for lists, keep answers focused
- Never give generic advice — make it specific to the student's situation

CAPABILITIES:
1. Career planning and personalised roadmap advice
2. DSA, System Design, Behavioral, and HR interview preparation
3. Resume critique and ATS optimisation
4. Skill gap identification with learning resource recommendations
5. Opportunity matching (internships, hackathons, GSoC, fellowships)
6. Salary negotiation and offer comparison
7. Open-source and project guidance to build a strong portfolio`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message:  string;
      history:  GeminiContent[];
      profile:  Record<string, unknown>;
    };

    const { message, history = [], profile = {} } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Inject the student's profile into the system instruction
    const profileBlock = Object.keys(profile).length > 0
      ? `\n\n--- STUDENT PROFILE (use this to personalise every response) ---\n${JSON.stringify(profile, null, 2)}\n---`
      : '';

    const system = SYSTEM_BASE + profileBlock;

    const reply = await geminiChat(system, history, message, {
      temperature: 0.75,
      maxTokens:   1200,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentor API failed';
    console.error('[POST /api/mentor]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}