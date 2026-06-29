// app/api/resume/route.ts
// Receives { resumeText, targetRole, uid, fileName }.
// Calls Gemini for ATS scoring, section analysis, skill extraction,
// and improvement suggestions. Returns { analysis } shaped as ResumeAnalysis.

import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/gemini';
import type { ResumeSection } from '@/types';

export const runtime = 'nodejs';

const SYSTEM = `You are a senior tech recruiter and ATS specialist with 10+ years of experience hiring for Google, Microsoft, and top Indian product companies. You review hundreds of resumes weekly.

Analyse the student's resume text for the given target role and return a detailed, specific JSON evaluation. Be honest and critical — vague feedback is useless. Reference actual content from the resume in your feedback.

SCORING RUBRIC (0–100 for each section):
- Impact:      Quantified achievements, strong action verbs, specificity of bullet points
- ATS:         Keyword density for the target role, standard section names, no tables/graphics in text
- Skills:      Relevant tech skills present, appropriate depth shown through projects
- Format:      Consistent date formatting, length appropriate for experience (≤1 page for <3 yrs), clean structure
- Experience:  Quality and relevance of internships, projects, open source, research
- Summary:     Clear value proposition, role-specific tailoring, concise professional tone

status rules: 'good' = score ≥ 80, 'ok' = 60–79, 'bad' = < 60`;

interface GeminiResumeResult {
  overallScore:    number;
  atsScore:        number;
  extractedSkills: string[];
  missingSkills:   string[];
  sections:        ResumeSection[];
  suggestions:     string[];
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, targetRole, uid, fileName } = await req.json() as {
      resumeText: string;
      targetRole: string;
      uid:        string;
      fileName:   string;
    };

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }
    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const userPrompt = `TARGET ROLE: ${targetRole || 'Software Engineer'}

RESUME TEXT (extracted from PDF):
${resumeText.slice(0, 6000)}

Return EXACTLY this JSON structure — no extra keys, no omissions:
{
  "overallScore": <weighted average of section scores, 0–100>,
  "atsScore": <ATS section score, 0–100>,
  "extractedSkills": ["<skill found in resume>", ...],
  "missingSkills": ["<important skill for ${targetRole} NOT in resume>", ...],
  "sections": [
    { "label": "Impact",     "score": <0–100>, "feedback": "<1–2 sentences referencing specific resume content>", "status": "<good|ok|bad>" },
    { "label": "ATS",        "score": <0–100>, "feedback": "<1–2 sentences>", "status": "<good|ok|bad>" },
    { "label": "Skills",     "score": <0–100>, "feedback": "<1–2 sentences>", "status": "<good|ok|bad>" },
    { "label": "Format",     "score": <0–100>, "feedback": "<1–2 sentences>", "status": "<good|ok|bad>" },
    { "label": "Experience", "score": <0–100>, "feedback": "<1–2 sentences>", "status": "<good|ok|bad>" },
    { "label": "Summary",    "score": <0–100>, "feedback": "<1–2 sentences>", "status": "<good|ok|bad>" }
  ],
  "suggestions": [
    "<specific, actionable improvement 1 — cite the actual weak section>",
    "<specific improvement 2>",
    "<specific improvement 3>",
    "<specific improvement 4>",
    "<specific improvement 5>"
  ]
}`;

    const result = await geminiJSON<GeminiResumeResult>(SYSTEM, userPrompt, {
      temperature: 0.3,
      maxTokens:   2048,
    });

    const analysis = {
      uid,
      fileName,
      rawText:    resumeText.slice(0, 1500),
      analyzedAt: new Date().toISOString(),
      ...result,
    };

    return NextResponse.json({ analysis });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Resume analysis failed';
    console.error('[POST /api/resume]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}