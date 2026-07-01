// lib/gemini.ts
// Server-side only — never imported from client components.
// Wraps the Gemini 1.5 Flash REST API using native fetch so no extra
// SDK package is required. Called exclusively from app/api/* route handlers.

const BASE_URL =
'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getKey(): string {
  const k = process.env.GEMINI_API_KEY;

  console.log("KEY PREFIX:", k?.slice(0, 15));

  if (!k) {
    throw new Error("GEMINI_API_KEY missing");
  }

  return k;
}

// Gemini content part
export interface GeminiPart    { text: string }
export interface GeminiContent { role: 'user' | 'model'; parts: GeminiPart[] }

interface GeminiResponse {
  candidates: Array<{
    content: { parts: GeminiPart[] };
    finishReason: string;
  }>;
  error?: { message: string; code: number };
}

// ── Core text generation ─────────────────────────────────────
// system   : instruction injected as system_instruction (not visible in history)
// history  : prior turns in Gemini format (role: 'user'|'model')
// userMsg  : the new user turn to respond to
export async function geminiChat(
  system: string,
  history: GeminiContent[],
  userMsg: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
    generationConfig: {
      temperature:     opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens   ?? 1024,
      topK:  40,
      topP:  0.95,
    },
  };

  const res = await fetch(`${BASE_URL}?key=${getKey()}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const data: GeminiResponse = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `Gemini API error ${res.status}: ${data.error?.message ?? 'unknown error'}`,
    );
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

// ── JSON-enforced generation ─────────────────────────────────
// Forces the model to return valid JSON only. Strips accidental code fences
// and parses into the expected type T.
export async function geminiJSON<T>(
  system: string,
  userMsg: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<T> {
  const jsonSystem =
    system +
    '\n\nCRITICAL: Your entire response must be valid JSON only.' +
    ' No markdown fences, no explanation text before or after the JSON object.';

  const raw = await geminiChat(jsonSystem, [], userMsg, {
    temperature: opts.temperature ?? 0.3, // lower temp for structured output
    maxTokens:   opts.maxTokens   ?? 2048,
  });

  // Strip any accidental ```json ... ``` wrappers
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}