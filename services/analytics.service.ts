// services/analytics.service.ts
// One Firestore document per user for their analytics snapshot.
// Uses Firebase Admin SDK for server-side API routes.

import {
  fsGetAdmin,
  fsMergeAdmin,
} from './firestore-admin.service';

import type { AnalyticsData } from '@/types';

const COL = 'analytics';

export async function getAnalytics(
  uid: string,
): Promise<AnalyticsData | null> {
  return fsGetAdmin<AnalyticsData>(COL, uid);
}

export async function upsertAnalytics(
  uid: string,
  data: Partial<Omit<AnalyticsData, 'uid'>>,
): Promise<void> {
  await fsMergeAdmin(COL, uid, {
    uid,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}