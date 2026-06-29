// services/user.service.ts
// Read / write the UserProfile document in Firestore.

import { fsGet, fsSet, fsMerge } from './firestore.service';
import type { UserProfile } from '@/types';

const COL = 'users';

export async function getUser(uid: string): Promise<UserProfile | null> {
  return fsGet<UserProfile>(COL, uid);
}

export async function createUser(profile: UserProfile): Promise<void> {
  await fsSet(COL, profile.uid, profile);
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid'>>,
): Promise<void> {
  await fsMerge(COL, uid, { uid, ...data });
}