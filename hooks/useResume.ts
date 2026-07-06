'use client';
// hooks/useResume.ts
// 1. Extracts text from PDF client-side (binary scan — works without pdfjs)
// 2. Calls /api/resume (server-side Gemini analysis)
// 3. Persists result to Firestore via resume.service.ts
// 4. Loads history from Firestore on demand

import { useState, useCallback } from 'react';
import { saveAnalysis, getResumeHistory } from '@/services/resume.service';
import type { ResumeAnalysis } from '@/types';

// ── Simple PDF → text extractor (no external dependency) ────
// Reads the binary, picks printable ASCII chars, collapses whitespace.
// Works well for text-based PDFs. For scanned/image PDFs, the backend
// should use a dedicated extraction service.
async function extractPdfText(file: File): Promise<string> {
  const buf   = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const parts: string[] = [];
  let chunk = '';

  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c >= 32 && c <= 126) {
      chunk += String.fromCharCode(c);
    } else if (c === 10 || c === 13 || c === 9) {
      chunk += ' ';
    } else if (chunk.length > 0) {
      parts.push(chunk);
      chunk = '';
    }
  }
  if (chunk) parts.push(chunk);

  return parts
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 3500); // Keep the prompt compact to avoid Gemini truncation
}

interface UseResumeReturn {
  analysis:    ResumeAnalysis | null;
  history:     ResumeAnalysis[];
  loading:     boolean;
  error:       string;
  analyzeFile: (file: File, uid: string, targetRole: string) => Promise<void>;
  loadHistory: (uid: string) => Promise<void>;
  selectItem:  (item: ResumeAnalysis) => void;
}

export function useResume(): UseResumeReturn {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [history,  setHistory]  = useState<ResumeAnalysis[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ── Analyse a new file ─────────────────────────────────────
  const analyzeFile = useCallback(async (
    file: File,
    uid: string,
    targetRole: string,
  ) => {
    setLoading(true);
    setError('');

    try {
      // 1. Extract text
      const resumeText = await extractPdfText(file);
      if (resumeText.length < 80) {
        throw new Error(
          'Could not extract readable text from this PDF. ' +
          'Please ensure the file is not image-only or password-protected.',
        );
      }

      // 2. Call Gemini via API route
      const res = await fetch('/api/resume', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
          uid,
          fileName: file.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      // 3. Persist to Firestore
      const id = await saveAnalysis(data.analysis as Omit<ResumeAnalysis, 'id'>);
      const saved: ResumeAnalysis = { id, ...data.analysis };

      setAnalysis(saved);
      setHistory(prev => [saved, ...prev].slice(0, 10));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resume analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load history from Firestore ───────────────────────────
  const loadHistory = useCallback(async (uid: string) => {
    try {
      const items = await getResumeHistory(uid);
      setHistory(items);
      if (items.length > 0 && !analysis) setAnalysis(items[0]);
    } catch (e) {
      console.error('[useResume] loadHistory', e);
    }
  }, [analysis]);

  // ── Switch displayed analysis from history ────────────────
  const selectItem = useCallback((item: ResumeAnalysis) => {
    setAnalysis(item);
  }, []);

  return { analysis, history, loading, error, analyzeFile, loadHistory, selectItem };
}