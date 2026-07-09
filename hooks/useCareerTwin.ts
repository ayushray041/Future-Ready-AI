'use client';
// hooks/useCareerTwin.ts
// Loads cached CareerTwin from Firestore.
// Re-generates via /api/career-twin if missing or older than STALE_MS.
// Persists fresh results back to Firestore.

import { useState, useCallback } from 'react';
import { getTwin, saveTwin } from '@/services/career-twin.service';
import type { CareerTwinData, UserProfile, ResumeAnalysis } from '@/types';

const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UseCareerTwinReturn {
  twin:           CareerTwinData | null;
  loading:        boolean;
  error:          string;
  generate:       (profile: UserProfile, resume?: ResumeAnalysis | null) => Promise<void>;
  loadOrGenerate: (uid: string, profile: UserProfile, resume?: ResumeAnalysis | null) => Promise<void>;
}

export function useCareerTwin(): UseCareerTwinReturn {
  const [twin,    setTwin]    = useState<CareerTwinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Call Gemini via API route, then persist ───────────────
  const generate = useCallback(async (
    profile: UserProfile,
    resume?: ResumeAnalysis | null,
  ) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/career-twin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: profile.uid,
          profile: {
            displayName:       profile.displayName,
            year:              profile.year,
            branch:            profile.branch,
            college:           profile.college,
            targetCareer:      profile.targetCareer,
            skills:            profile.skills,
            goals:             profile.goals,
            salaryExpectation: profile.salaryExpectation,
          },
          resumeAnalysis: resume
            ? {
                overallScore:    resume.overallScore,
                extractedSkills: resume.extractedSkills,
                missingSkills:   resume.missingSkills,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const twinData: CareerTwinData = { id: profile.uid, ...data.twin };
      setTwin(twinData);
      await saveTwin(profile.uid, data.twin);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Career Twin generation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load from cache or regenerate ────────────────────────
  const loadOrGenerate = useCallback(async (
    uid: string,
    profile: UserProfile,
    resume?: ResumeAnalysis | null,
  ) => {
    setLoading(true);
    setError('');

    try {
      const cached = await getTwin(uid);
      if (cached) {
        const ageMs = Date.now() - new Date(cached.generatedAt).getTime();
        if (ageMs < STALE_MS) {
          setTwin(cached);
          setLoading(false);
          return;
        }
      }
      // Cache missing or stale — regenerate
      await generate(profile, resume);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load Career Twin');
      setLoading(false);
    }
  }, [generate]);

  return { twin, loading, error, generate, loadOrGenerate };
} 