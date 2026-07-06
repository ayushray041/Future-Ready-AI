'use client';

import { useState, useCallback } from 'react';
import type {
  InterviewCategoryId,
  InterviewDifficulty,
  InterviewEvaluationResult,
  InterviewEvaluationRequest,
} from '@/types/interview';

interface UseInterviewReturn {
  evaluation: InterviewEvaluationResult | null;
  loading: boolean;
  error: string;
  submitInterviewAnswer: (request: InterviewEvaluationRequest) => Promise<InterviewEvaluationResult>;
  resetEvaluation: () => void;
}

export function useInterview(): UseInterviewReturn {
  const [evaluation, setEvaluation] = useState<InterviewEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitInterviewAnswer = useCallback(async (
    request: InterviewEvaluationRequest,
  ) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      if (!data.evaluation) {
        throw new Error('Interview evaluation response malformed');
      }

      setEvaluation(data.evaluation as InterviewEvaluationResult);
      return data.evaluation as InterviewEvaluationResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Interview submission failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetEvaluation = useCallback(() => {
    setEvaluation(null);
    setError('');
  }, []);

  return {
    evaluation,
    loading,
    error,
    submitInterviewAnswer,
    resetEvaluation,
  };
}
