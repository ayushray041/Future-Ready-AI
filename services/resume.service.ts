// services/resume.service.ts
// Firestore persistence for ResumeAnalysis records.
// AI scoring is done in app/api/resume/route.ts.

import { fsAdd, fsQuery, fsGet, fsDelete } from './firestore.service';
import type { ResumeAnalysis } from '@/types';

const COL = 'resumeAnalyses';

export async function saveAnalysis(
  data: Omit<ResumeAnalysis, 'id'>,
): Promise<string> {
  return fsAdd(COL, data);
}

export async function getResumeHistory(uid: string): Promise<ResumeAnalysis[]> {
  return fsQuery<ResumeAnalysis>(COL, [['uid', '==', uid]], 'analyzedAt', 10);
}

export async function getResumeAnalysis(id: string): Promise<ResumeAnalysis | null> {
  return fsGet<ResumeAnalysis>(COL, id);
}

export async function clearResumeHistory(uid: string): Promise<void> {
  const items = await getResumeHistory(uid);
  await Promise.all(items.map(item => fsDelete(COL, item.id)));
}