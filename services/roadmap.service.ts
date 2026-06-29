// services/roadmap.service.ts
// Responsibility: CRUD for user career roadmaps stored in Firestore.
// Called only by hooks/useRoadmap.ts.

import type { Roadmap } from '@/types/roadmap';

export const roadmapService = {
  async getRoadmap(_userId: string): Promise<Roadmap | null> {
    return null; // Module 2: firestoreService.getDoc('roadmaps', userId)
  },
  async saveRoadmap(_roadmap: Roadmap): Promise<void> {
    // Module 2: firestoreService.setDoc
  },
};
