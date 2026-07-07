// app/api/resume/route.ts
// Receives { resumeText, targetRole, uid, fileName }.
// Calls Gemini for ATS scoring, section analysis, skill extraction,
// and improvement suggestions. Returns { analysis } shaped as ResumeAnalysis.

import { createRequire } from 'module';
import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/gemini';
import type { ResumeSection } from '@/types';

const require = createRequire(import.meta.url);

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

const COMMON_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'next.js', 'node.js', 'java', 'c++', 'c#', 'sql',
  'postgres', 'mongodb', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git',
  'linux', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'tableau', 'spark', 'llm', 'nlp', 'langchain',
  'fastapi', 'flask', 'django', 'tailwind', 'graphql', 'firebase', 'terraform', 'ci/cd', 'rest api', 'api', 'machine learning'
];

const SKILL_VARIANTS: Record<string, string[]> = {
  python: ['python', 'py'],
  javascript: ['javascript', 'js'],
  typescript: ['typescript', 'ts'],
  react: ['react', 'reactjs', 'react.js'],
  'next.js': ['next.js', 'nextjs'],
  'node.js': ['node.js', 'nodejs', 'node'],
  sql: ['sql', 'postgresql', 'postgres', 'mysql', 'sqlite'],
  aws: ['aws', 'amazon web services'],
  azure: ['azure', 'microsoft azure'],
  gcp: ['gcp', 'google cloud'],
  docker: ['docker', 'containers'],
  kubernetes: ['kubernetes', 'k8s'],
  tensorflow: ['tensorflow', 'tf'],
  pytorch: ['pytorch', 'torch'],
  pandas: ['pandas', 'pd'],
  numpy: ['numpy', 'np'],
  llm: ['llm', 'large language model'],
  nlp: ['nlp', 'natural language processing'],
  langchain: ['langchain'],
  'machine learning': ['machine learning', 'ml'],
  'rest api': ['rest api', 'restful api', 'api'],
};

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
      useWorkerFetch: false,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    let text = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      text += `${pageText}\n`;
    }

    return text.replace(/\s+/g, ' ').trim().slice(0, 12000);
  } catch (err) {
    console.warn('[POST /api/resume] PDF text extraction failed, falling back to raw buffer scan', err);
    return buffer.toString('latin1').replace(/\s+/g, ' ').trim().slice(0, 12000);
  }
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+/.#\-\s]/g, ' ');
}

function matchSkill(normalizedText: string, skill: string): boolean {
  const variants = SKILL_VARIANTS[skill] ?? [skill];
  return variants.some(variant => normalizedText.includes(variant.toLowerCase()));
}

function extractResumeSkills(resumeText: string, targetRole: string): string[] {
  const normalized = normalizeText(resumeText);
  const roleKeywords = ROLE_KEYWORDS[targetRole] ?? ROLE_KEYWORDS['Software Engineer'];
  const found = new Set<string>();

  roleKeywords.forEach(keyword => {
    if (matchSkill(normalized, keyword)) {
      found.add(keyword);
    }
  });

  COMMON_SKILLS.forEach(skill => {
    if (matchSkill(normalized, skill)) {
      found.add(skill);
    }
  });

  return Array.from(found).slice(0, 8).map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
}

export function buildContentAwareAnalysis(
  resumeText: string,
  targetRole: string,
  uid: string,
  fileName: string,
) {
  const normalized = resumeText.toLowerCase();
  const roleKeywords = ROLE_KEYWORDS[targetRole] ?? ROLE_KEYWORDS['Software Engineer'];
  const extractedSkills = extractResumeSkills(resumeText, targetRole);
  const foundSkillSet = new Set(extractedSkills.map(skill => skill.toLowerCase()));
  const missingSkills = roleKeywords
    .filter(keyword => !normalized.includes(keyword.toLowerCase()) && !foundSkillSet.has(keyword.toLowerCase()))
    .slice(0, 5)
    .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));

  const hasExperience = /(experience|internship|intern|projects?|work history|employment|career history|developer|engineer|research|software)/i.test(resumeText);
  const hasMetrics = /\b\d+(%|x|\s*(years|months|days)|k|m)?\b/i.test(resumeText);
  const hasEducation = /(education|b\.tech|btech|degree|university|college|masters|mba|phd)/i.test(resumeText);
  const hasSkillsSection = /(skills|technologies|tools|languages|frameworks|stack)/i.test(resumeText);
  const hasSummary = /(summary|profile|about me|objective)/i.test(resumeText);
  const hasProjects = /(projects?|portfolio|hackathon|research)/i.test(resumeText);
  const hasContact = /(email|phone|linkedin|github|portfolio)/i.test(resumeText);

  const impactScore = Math.min(95, 40 + (hasMetrics ? 20 : 0) + (hasExperience ? 15 : 0) + (extractedSkills.length >= 3 ? 10 : 0) + (hasProjects ? 10 : 0));
  const atsScore = Math.min(95, 35 + (hasSkillsSection ? 10 : 0) + (extractedSkills.length * 5) + (hasEducation ? 5 : 0) + (hasContact ? 5 : 0));
  const skillsScore = Math.min(95, 35 + (extractedSkills.length * 7) + (hasSkillsSection ? 10 : 0) + (hasProjects ? 8 : 0));
  const formatScore = Math.min(95, 55 + (hasSkillsSection ? 10 : 0) + (hasEducation ? 10 : 0) + (hasSummary ? 10 : 0));
  const experienceScore = Math.min(95, 35 + (hasExperience ? 20 : 0) + (hasProjects ? 15 : 0) + (hasMetrics ? 10 : 0));
  const summaryScore = Math.min(95, 50 + (hasSummary ? 15 : 0) + (hasContact ? 10 : 0) + (hasEducation ? 10 : 0));
  const overallScore = Math.round((impactScore + atsScore + skillsScore + formatScore + experienceScore + summaryScore) / 6);

  const impactFeedback = hasMetrics
    ? `Your resume highlights concrete work with measurable detail, but it should keep reinforcing outcomes for ${targetRole}.`
    : 'Add measurable achievements and outcome-focused bullets to make the impact of your experience more tangible.';
  const atsFeedback = extractedSkills.length > 0
    ? `The resume contains ${extractedSkills.slice(0, 3).join(', ')} and should be tuned further for ${targetRole} keywords.`
    : `The resume does not yet show enough ${targetRole} keywords for strong ATS alignment.`;
  const skillsFeedback = extractedSkills.length > 0
    ? `The resume clearly references ${extractedSkills.slice(0, 3).join(', ')}; add a few more role-relevant tools and frameworks.`
    : 'Add a stronger skills section with concrete technologies relevant to this role.';
  const formatFeedback = hasSummary && hasSkillsSection
    ? 'The structure is already readable, but tightening section order and consistency will make it easier to scan.'
    : 'Make the resume easier to scan with clearer section headings and a concise summary.';
  const experienceFeedback = hasProjects
    ? 'Projects and work history are present, so the next step is to sharpen their relevance to the target role.'
    : 'Expand the experience section with project details and responsibilities that map to the role.';
  const summaryFeedback = hasSummary
    ? 'The summary is present, but it should more directly state your value proposition and fit for the role.'
    : 'Add a short summary that explains your background and why you are a fit for this role.';

  const sections: ResumeSection[] = [
    { label: 'Impact', score: impactScore, feedback: impactFeedback, status: impactScore >= 80 ? 'good' : impactScore >= 60 ? 'ok' : 'bad' },
    { label: 'ATS', score: atsScore, feedback: atsFeedback, status: atsScore >= 80 ? 'good' : atsScore >= 60 ? 'ok' : 'bad' },
    { label: 'Skills', score: skillsScore, feedback: skillsFeedback, status: skillsScore >= 80 ? 'good' : skillsScore >= 60 ? 'ok' : 'bad' },
    { label: 'Format', score: formatScore, feedback: formatFeedback, status: formatScore >= 80 ? 'good' : formatScore >= 60 ? 'ok' : 'bad' },
    { label: 'Experience', score: experienceScore, feedback: experienceFeedback, status: experienceScore >= 80 ? 'good' : experienceScore >= 60 ? 'ok' : 'bad' },
    { label: 'Summary', score: summaryScore, feedback: summaryFeedback, status: summaryScore >= 80 ? 'good' : summaryScore >= 60 ? 'ok' : 'bad' },
  ];

  const suggestions = [
    hasMetrics ? 'Keep the strongest achievements near the top and quantify them with outcomes and scale.' : 'Add measurable results such as percentages, revenue impact, or team size to strengthen the resume.',
    missingSkills.length > 0 ? `Add more ${targetRole} keywords such as ${missingSkills.slice(0, 3).join(', ')}.` : `Continue reflecting the strongest ${targetRole} tools and concepts in the skills and project sections.`,
    hasProjects ? 'Make the project section more outcome-focused by describing the problem, approach, and business impact.' : 'Add one or two project examples that show how you solved real problems with the tools you listed.',
    hasSummary ? 'Tighten the summary so it directly states your core strengths and role fit.' : 'Add a short summary that highlights your background, top skills, and target role fit.',
  ];

  return {
    overallScore,
    atsScore,
    extractedSkills,
    missingSkills,
    sections,
    suggestions,
    uid,
    fileName,
    rawText: resumeText.slice(0, 1500),
    analyzedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    let resumeText = '';
    let targetRole = 'Software Engineer';
    let uid = '';
    let fileName = 'resume.pdf';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const uploadedFile = formData.get('file');
      const uploadedTargetRole = formData.get('targetRole');
      const uploadedUid = formData.get('uid');

      if (uploadedFile && typeof uploadedFile !== 'string' && 'arrayBuffer' in uploadedFile) {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        resumeText = await extractPdfText(Buffer.from(arrayBuffer));
        fileName = uploadedFile.name || fileName;
      }

      if (typeof uploadedTargetRole === 'string' && uploadedTargetRole.trim()) {
        targetRole = uploadedTargetRole;
      }
      if (typeof uploadedUid === 'string' && uploadedUid.trim()) {
        uid = uploadedUid;
      }
    } else {
      const payload = await req.json() as {
        resumeText?: string;
        targetRole?: string;
        uid?: string;
        fileName?: string;
      };

      resumeText = payload.resumeText ?? '';
      targetRole = payload.targetRole ?? 'Software Engineer';
      uid = payload.uid ?? '';
      fileName = payload.fileName ?? fileName;
    }

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }
    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const compactResumeText = resumeText.replace(/\s+/g, ' ').trim().slice(0, 12000);
    const userPrompt = `TARGET ROLE: ${targetRole || 'Software Engineer'}

RESUME TEXT (extracted from the uploaded PDF):
${compactResumeText}

IMPORTANT: Evaluate the resume based only on the content above. Reference specific details from the resume in your feedback and suggestions rather than giving generic advice.

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
      result = buildContentAwareAnalysis(compactResumeText, targetRole, uid, fileName) as GeminiResumeResult;
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