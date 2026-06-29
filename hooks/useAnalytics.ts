'use client';
// hooks/useAnalytics.ts
// Loads AnalyticsData from Firestore (seeds defaults on first use),
// then calls /api/analytics for Gemini-generated text insights.

import { useState, useCallback } from 'react';
import { getAnalytics, upsertAnalytics } from '@/services/analytics.service';
import type { AnalyticsData, AiInsight, UserProfile } from '@/types';

// ── Seed data for brand-new users ────────────────────────────
function buildDefault(uid: string, profile: UserProfile): AnalyticsData {
  const now    = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('default', { month: 'short' });
  });

  const base = Math.max(30, profile.careerScore ?? 50);

  return {
    uid,
    careerScore: base,
    careerTrend: months.map((month, i) => ({
      month,
      score:  Math.min(99, Math.round(base - (5 - i) * 4 + Math.random() * 3)),
      target: 85,
      peer:   Math.round(58 + i * 2),
    })),
    skillScores: profile.skills.slice(0, 6).map((skill, i) => ({
      skill,
      score: Math.round(42 + i * 8 + Math.random() * 12),
    })),
    applications: months.map((month, i) => ({
      month,
      applied:    Math.max(0, i - 2),
      interviews: Math.max(0, i - 4),
    })),
    interviewPerf: [],
    insights:      [],
    updatedAt: new Date().toISOString(),
  };
}

interface UseAnalyticsReturn {
  analytics:       AnalyticsData | null;
  insights:        AiInsight[];
  loading:         boolean;
  insightsLoading: boolean;
  error:           string;
  load:            (uid: string, profile: UserProfile) => Promise<void>;
  refreshInsights: (profile: UserProfile) => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics,       setAnalytics]       = useState<AnalyticsData | null>(null);
  const [insights,        setInsights]        = useState<AiInsight[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error,           setError]           = useState('');

  // ── Fetch AI insights for current analytics data ───────────
  const fetchInsights = useCallback(async (
    data: AnalyticsData,
    profile: UserProfile,
  ) => {
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/analytics', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerScore:   data.careerScore,
          targetScore:   85,
          streak:        profile.streak,
          skillScores:   data.skillScores,
          applications:  data.applications,
          interviewPerf: data.interviewPerf,
          targetCareer:  profile.targetCareer,
          year:          profile.year,
        }),
      });

      const result = await res.json();
      if (res.ok && Array.isArray(result.insights)) {
        setInsights(result.insights as AiInsight[]);
      }
    } catch (e) {
      console.error('[useAnalytics] fetchInsights', e);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  // ── Load analytics from Firestore (seed if new user) ──────
  const load = useCallback(async (uid: string, profile: UserProfile) => {
    setLoading(true);
    setError('');
    try {
      let data = await getAnalytics(uid);
      if (!data) {
        data = buildDefault(uid, profile);
        await upsertAnalytics(uid, data);
      }
      setAnalytics(data);
      await fetchInsights(data, profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [fetchInsights]);

  // ── Re-run Gemini insights on demand ──────────────────────
  const refreshInsights = useCallback(async (profile: UserProfile) => {
    if (analytics) await fetchInsights(analytics, profile);
  }, [analytics, fetchInsights]);

  return {
    analytics,
    insights,
    loading,
    insightsLoading,
    error,
    load,
    refreshInsights,
  };
}