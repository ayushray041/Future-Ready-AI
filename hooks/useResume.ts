'use client';
// hooks/useResume.ts
// 1. Extracts text from PDF client-side (binary scan — works without pdfjs)
// 2. Calls /api/resume (server-side Gemini analysis)
// 3. Persists result to Firestore via resume.service.ts
// 4. Loads history from Firestore on demand

import { useState, useCallback } from 'react';
import { saveAnalysis, getResumeHistory, clearResumeHistory } from '@/services/resume.service';
import type { ResumeAnalysis } from '@/types';

interface UseResumeReturn {
  analysis:    ResumeAnalysis | null;
  history:     ResumeAnalysis[];
  loading:     boolean;
  error:       string;
  analyzeFile: (file: File, uid: string, targetRole: string) => Promise<void>;
  loadHistory: (uid: string) => Promise<void>;
  clearHistory: (uid: string) => Promise<void>;
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', targetRole);
      formData.append('uid', uid);

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
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

  // ── Clear saved history ───────────────────────────────────
  const clearHistory = useCallback(async (uid: string) => {
    try {
      await clearResumeHistory(uid);
      setHistory([]);
      setAnalysis(null);
    } catch (e) {
      console.error('[useResume] clearHistory', e);
      throw e;
    }
  }, []);

  // ── Switch displayed analysis from history ────────────────
  const selectItem = useCallback((item: ResumeAnalysis) => {
    setAnalysis(item);
  }, []);

  return { analysis, history, loading, error, analyzeFile, loadHistory, clearHistory, selectItem };
}