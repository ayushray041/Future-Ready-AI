// services/career-twin.service.ts
// One Firestore document per user (uid = doc id) for their Career Twin.

import { fsGet, fsSet } from './firestore.service';
import type { CareerTwinData } from '@/types';

const COL = 'careerTwins';

export async function getTwin(uid: string): Promise<CareerTwinData | null> {
  return fsGet<CareerTwinData>(COL, uid);
}

export async function saveTwin(
  uid: string,
  data: Omit<CareerTwinData, 'id'>,
): Promise<void> {
  await fsSet(COL, uid, data);
}