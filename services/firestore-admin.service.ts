import { adminDb } from "@/lib/firebase-admin";

export async function fsAddAdmin<T extends object>(
  col: string,
  data: T
): Promise<string> {
  const now = new Date().toISOString();

  const docRef = await adminDb.collection(col).add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function fsGetAdmin<T>(
  col: string,
  id: string
): Promise<T | null> {
  const doc = await adminDb.collection(col).doc(id).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as T;
}

export async function fsMergeAdmin<T extends object>(
  col: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await adminDb.collection(col).doc(id).set(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    {
      merge: true,
    }
  );
}