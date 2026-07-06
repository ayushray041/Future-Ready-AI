// app/api/resume/route.ts
// Receives { resumeText, targetRole, uid, fileName }.
// Calls Gemini for ATS scoring, section analysis, skill extraction,
// and improvement suggestions. Returns { analysis } shaped as ResumeAnalysis.

import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/gemini';
import type { ResumeSection } from '@/types';

export const runtime = 'nodejs';

const SYSTEM = `You are a senior tech recruiter and ATS specialist with 10+ years of experience hiring for Google, Microsoft, and top Indian product companies. You review hundreds of resumes weekly.

Analyse the student's resume text for the given target role and return a concise JSON evaluation. Be honest and critical — vague feedback is useless. Reference actual content from the resume in your feedback.

SCORING RUBRIC (0–100 for each section):
- Impact: quantified achievements, strong action verbs, specificity
- ATS: keyword density for the target role, standard section names
- Skills: relevant tech skills present, evidence of depth
- Format: consistent structure and reasonable length
- Experience: relevance of projects, internships, research
- Summary: clear role-fit value proposition

status rules: 'good' = score ≥ 80, 'ok' = 60–79, 'bad' = < 60`;

interface GeminiResumeResult {
  overallScore:    number;
  atsScore:        number;
  extractedSkills: string[];
  missingSkills:   string[];
  sections:        ResumeSection[];
  suggestions:     string[];
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  'AI Engineer': ['python', 'pytorch', 'tensorflow', 'machine learning', 'llm', 'nlp', 'langchain', 'aws', 'docker'],
  'Software Engineer': ['javascript', 'typescript', 'react', 'node.js', 'python', 'sql', 'api', 'docker', 'aws'],
  'Data Scientist': ['python', 'sql', 'pandas', 'numpy', 'machine learning', 'statistics', 'tableau', 'spark'],
  'ML Engineer': ['python', 'pytorch', 'tensorflow', 'machine learning', 'mlops', 'deployment', 'aws', 'docker'],
  'Full Stack Developer': ['javascript', 'typescript', 'react', 'node.js', 'sql', 'api', 'docker'],
  'Cloud Engineer': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'linux', 'ci/cd'],
  'DevOps Engineer': ['docker', 'kubernetes', 'linux', 'aws', 'ci/cd', 'terraform', 'jenkins'],
  'Product Manager': ['product strategy', 'roadmap', 'analytics', 'stakeholder management', 'agile'],
};

function buildFallbackAnalysis(
  resumeText: string,
  targetRole: string,
  uid: string,
  fileName: string,
) {
  const normalized = resumeText.toLowerCase();
  const keywordList = ROLE_KEYWORDS[targetRole] ?? ROLE_KEYWORDS['Software Engineer'];
  const extractedSkills = keywordList.filter(keyword => normalized.includes(keyword));
  const missingSkills = keywordList.filter(keyword => !normalized.includes(keyword)).slice(0, 5);

  const hasExperience = /(experience|intern|project|work|developer|engineer|research|software)/i.test(resumeText);
  const hasMetrics = /\b\d+(%|x|\s*(years|months|days)|k|m)?\b/i.test(resumeText);
  const hasEducation = /(education|b\.tech|btech|degree|university|college|masters|mba)/i.test(resumeText);
  const hasSkillsSection = /(skills|technologies|tools|languages)/i.test(resumeText);

  const impactScore = Math.min(95, 45 + (hasMetrics ? 20 : 0) + (hasExperience ? 15 : 0) + (extractedSkills.length > 2 ? 10 : 0));
  const atsScore = Math.min(95, 40 + (hasSkillsSection ? 10 : 0) + (extractedSkills.length * 6) + (hasEducation ? 5 : 0));
  const skillsScore = Math.min(95, 40 + (extractedSkills.length * 8) + (hasSkillsSection ? 10 : 0));
  const formatScore = Math.min(95, 60 + (hasSkillsSection ? 10 : 0) + (hasEducation ? 10 : 0));
  const experienceScore = Math.min(95, 35 + (hasExperience ? 20 : 0) + (extractedSkills.length > 1 ? 15 : 0));
  const summaryScore = Math.min(95, 55 + (hasExperience ? 10 : 0) + (hasEducation ? 10 : 0));

  const overallScore = Math.round((impactScore + atsScore + skillsScore + formatScore + experienceScore + summaryScore) / 6);

  const sections: ResumeSection[] = [
    {
      label: 'Impact',
      score: impactScore,
      feedback: 'Add more quantified outcomes and stronger action verbs so the impact of your work stands out.',
      status: impactScore >= 80 ? 'good' : impactScore >= 60 ? 'ok' : 'bad',
    },
    {
      label: 'ATS',
      score: atsScore,
      feedback: `Improve keyword alignment for ${targetRole} by weaving in role-specific terms throughout the resume.`,
      status: atsScore >= 80 ? 'good' : atsScore >= 60 ? 'ok' : 'bad',
    },
    {
      label: 'Skills',
      score: skillsScore,
      feedback: 'Highlight the strongest technical skills and pair them with concrete project examples.',
      status: skillsScore >= 80 ? 'good' : skillsScore >= 60 ? 'ok' : 'bad',
    },
    {
      label: 'Format',
      score: formatScore,
      feedback: 'Keep the structure clean and consistent with clear section headings and readable formatting.',
      status: formatScore >= 80 ? 'good' : formatScore >= 60 ? 'ok' : 'bad',
    },
    {
      label: 'Experience',
      score: experienceScore,
      feedback: 'Expand the experience section with project outcomes, responsibilities, and relevance to the target role.',
      status: experienceScore >= 80 ? 'good' : experienceScore >= 60 ? 'ok' : 'bad',
    },
    {
      label: 'Summary',
      score: summaryScore,
      feedback: 'Tighten the summary so it clearly states your value proposition and role fit.',
      status: summaryScore >= 80 ? 'good' : summaryScore >= 60 ? 'ok' : 'bad',
    },
  ];

  return {
    overallScore,
    atsScore,
    extractedSkills: extractedSkills.slice(0, 8).map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)),
    missingSkills: missingSkills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)),
    sections,
    suggestions: [
      'Add measurable achievements such as impact, scale, and performance improvements.',
      `Tailor the resume wording around ${targetRole} keywords that are currently missing.`,
      'Bring the most relevant projects and internships closer to the top of the resume.',
      'Make the summary and skills section more specific to the role you want.',
    ],
    uid,
    fileName,
    rawText: resumeText.slice(0, 1500),
    analyzedAt: new Date().toISOString(),
  };
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

    const compactResumeText = resumeText.replace(/\s+/g, ' ').trim().slice(0, 3500);
    const userPrompt = `TARGET ROLE: ${targetRole || 'Software Engineer'}

RESUME TEXT (extracted from PDF):
${compactResumeText}

Return EXACTLY this JSON structure — no extra keys, no omissions:
{
  "overallScore": <0–100>,
  "atsScore": <0–100>,
  "extractedSkills": ["<skill found in resume>", ...],
  "missingSkills": ["<important skill for ${targetRole} NOT in resume>", ...],
  "sections": [
    { "label": "Impact", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" },
    { "label": "ATS", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" },
    { "label": "Skills", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" },
    { "label": "Format", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" },
    { "label": "Experience", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" },
    { "label": "Summary", "score": <0–100>, "feedback": "<short specific feedback>", "status": "<good|ok|bad>" }
  ],
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>", "<specific improvement 4>"]
}`;

    let result: GeminiResumeResult;

    try {
      result = await geminiJSON<GeminiResumeResult>(SYSTEM, userPrompt, {
        temperature: 0.2,
        maxTokens: 1024,
      });
    } catch (err) {
      console.warn('[POST /api/resume] Gemini failed, using fallback analysis', err);
      result = buildFallbackAnalysis(compactResumeText, targetRole, uid, fileName) as GeminiResumeResult;
    }

    const analysis = {
      uid,
      fileName,
      rawText: compactResumeText.slice(0, 1500),
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