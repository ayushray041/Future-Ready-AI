// hooks/useRoadmap.ts
// Responsibility: Fetches and manages the user's career roadmap state.
// Delegates persistence to roadmap.service.ts.

'use client';

import { useState } from 'react';
import type { Roadmap } from '@/types/roadmap';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadRoadmap(_userId: string) {
    // Wire to roadmap.service.ts in Module 2
  }

  return { roadmap, loading, loadRoadmap };
}
