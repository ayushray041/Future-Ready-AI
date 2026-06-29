// services/analytics.service.ts
// One Firestore document per user for their analytics snapshot.

import { fsGet, fsMerge } from './firestore.service';
import type { AnalyticsData } from '@/types';

const COL = 'analytics';

export async function getAnalytics(uid: string): Promise<AnalyticsData | null> {
  return fsGet<AnalyticsData>(COL, uid);
}

export async function upsertAnalytics(
  uid: string,
  data: Partial<Omit<AnalyticsData, 'uid'>>,
): Promise<void> {
  await fsMerge(COL, uid, {
    uid,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}