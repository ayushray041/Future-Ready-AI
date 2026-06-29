// services/mentor.service.ts
// Firestore persistence for AI Mentor sessions.
// Generation happens in app/api/mentor/route.ts (server-side Gemini).

import { fsGet, fsSet, fsQuery, fsAdd, fsMerge } from './firestore.service';
import type { MentorSession, MentorMessage } from '@/types';

const COL = 'mentorSessions';

export async function getActiveSession(uid: string): Promise<MentorSession | null> {
  const sessions = await fsQuery<MentorSession>(
    COL,
    [['uid', '==', uid]],
    'updatedAt',
    1,
  );
  return sessions[0] ?? null;
}

export async function createSession(uid: string): Promise<MentorSession> {
  const now = new Date().toISOString();
  const payload: Omit<MentorSession, 'id'> = {
    uid,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  const id = await fsAdd(COL, payload);
  return { id, ...payload };
}

export async function appendMessages(
  sessionId: string,
  messages: MentorMessage[],
): Promise<void> {
  await fsMerge(COL, sessionId, { messages, updatedAt: new Date().toISOString() });
}

export async function resetSession(sessionId: string, uid: string): Promise<void> {
  const now = new Date().toISOString();
  await fsSet(COL, sessionId, { uid, messages: [], createdAt: now, updatedAt: now });
}