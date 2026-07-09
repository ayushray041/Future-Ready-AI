// lib/gemini.ts
// Server-side only — never imported from client components.
// Wraps the Gemini 2.5 Flash REST API using native fetch so no extra
// SDK package is required. Called exclusively from app/api/* route handlers.

const BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function getKey(): string {
  const k = process.env.GEMINI_API_KEY;



  if (!k) {
    throw new Error('GEMINI_API_KEY missing');
  }

  return k;
}

// Gemini content part
export interface GeminiPart { text: string }
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
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 1800,
      topK: 40,
      topP: 0.95,
      responseMimeType: 'application/json',
    },
  };

  let res: Response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await fetch(`${BASE_URL}?key=${getKey()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (
      res.ok ||
      (res.status !== 429 &&
        res.status !== 500 &&
        res.status !== 503)
    ) {
      break;
    }

    console.warn(`Gemini retry ${attempt}/3`);

    await new Promise((resolve) =>
      setTimeout(resolve, attempt * 1000)
    );
  }

const data: GeminiResponse = await (res as Response).json();

 
  const candidate = data.candidates?.[0];

  if (!candidate) {
    throw new Error(
      'AI could not generate an evaluation. Please try again.'
    );
  }

  const text =
    candidate.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? '';

  if (!text.trim()) {
    throw new Error(
      'AI returned an empty response. Please retry.'
    );
  }

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
    temperature: opts.temperature ?? 0.3,
    maxTokens: opts.maxTokens ?? 2048,
  });
  
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

 try {
  return JSON.parse(cleaned) as T;
} catch {
  const jsonFragment = extractJsonFragment(cleaned);

  const candidates = [
    cleaned,
    jsonFragment,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {}

    try {
      return JSON.parse(completeJson(candidate)) as T;
    } catch {}

    try {
      return JSON.parse(
        sanitizeJsonStrings(completeJson(candidate))
      ) as T;
    } catch {}
  }

 

  throw new Error(
  "AI generated an invalid response. Please try again."
);
}
}

function sanitizeJsonStrings(text: string): string {
  let inString = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\n') {
        result += '\\n';
        continue;
      }
      if (char === '\r') {
        result += '\\r';
        continue;
      }
      if (char === '\t') {
        result += '\\t';
        continue;
      }
    }

    result += char;
  }

  return result;
}

function completeJson(text: string): string {
  const open = (text.match(/\{/g) || []).length;
  const close = (text.match(/\}/g) || []).length;
  if (open <= close) return text;
  return text + '}'.repeat(open - close);
}

function extractJsonFragment(text: string): string | null {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}
