// services/firestore.service.ts
// Generic, typed Firestore helpers used by every domain service.
// Keeps raw Firebase SDK imports in one place.
 
import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, query, where, orderBy, limit,
  getDocs, deleteDoc,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
 
// ── Read single document ─────────────────────────────────────
export async function fsGet<T>(col: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, col, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}
 
// ── Write / overwrite ────────────────────────────────────────
export async function fsSet<T extends object>(
  col: string,
  id: string,
  data: T,
): Promise<void> {
  await setDoc(doc(db, col, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
 
// ── Merge update ─────────────────────────────────────────────
export async function fsMerge<T extends object>(
  col: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await setDoc(
    doc(db, col, id),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}
 
// ── Add new document (auto-ID) ────────────────────────────────
export async function fsAdd<T extends object>(col: string, data: T): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, col), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}
 
// ── Query with filters ───────────────────────────────────────
export async function fsQuery<T>(
  col: string,
  filters: [string, WhereFilterOp, unknown][],
  orderByField?: string,
  limitTo?: number,
): Promise<T[]> {
  const constraints = filters.map(([field, op, value]) => where(field, op, value));
  let q = query(collection(db, col), ...constraints);
  if (orderByField) q = query(q, orderBy(orderByField, 'desc'));
  if (limitTo)      q = query(q, limit(limitTo));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}
 
// ── Delete ───────────────────────────────────────────────────
export async function fsDelete(col: string, id: string): Promise<void> {
  await deleteDoc(doc(db, col, id));
}