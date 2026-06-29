// hooks/useCareerScore.ts
// Responsibility: Computes and exposes the user's career readiness score.
// Score calculation logic lives in utils/calculations.ts.

'use client';

import { useState } from 'react';

export function useCareerScore() {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function refreshScore(_userId: string) {
    // Wire to calculations.ts + firestore.service.ts in Module 2
  }

  return { score, loading, refreshScore };
}
