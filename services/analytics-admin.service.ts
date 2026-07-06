import {
  fsGetAdmin,
  fsMergeAdmin,
} from './firestore-admin.service';

import type { AnalyticsData } from '@/types';

const COL = 'analytics';

export async function getAnalyticsAdmin(
  uid: string,
): Promise<AnalyticsData | null> {
  return fsGetAdmin<AnalyticsData>(COL, uid);
}

export async function upsertAnalyticsAdmin(
  uid: string,
  data: Partial<Omit<AnalyticsData, 'uid'>>,
): Promise<void> {
  await fsMergeAdmin(COL, uid, {
    uid,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}