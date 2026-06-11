import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { Holding, Transaction } from '@/lib/types/portfolio';
import type { UserProfile } from '@/lib/types/profile';
import type { PriceAlert } from '@/lib/types/alerts';
import type { RagDocument } from '@/lib/types/rag';

/** Current user's uid, or null when signed out. */
export function currentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ---- Collection / document references (scoped per user) ----
export const userDocRef      = (uid: string) => doc(db, 'users', uid);
export const holdingsCol     = (uid: string) => collection(db, 'users', uid, 'holdings');
export const transactionsCol = (uid: string) => collection(db, 'users', uid, 'transactions');
export const alertsCol       = (uid: string) => collection(db, 'users', uid, 'alerts');
export const ragDocumentsCol = (uid: string) => collection(db, 'users', uid, 'ragDocuments');

/** Firestore rejects `undefined` values — drop them before writing. */
function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// ---- Profile ----
export async function writeProfile(profile: Partial<UserProfile>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await setDoc(userDocRef(uid), clean(profile as Record<string, unknown>), { merge: true });
}

// ---- Holdings ----
export async function addHoldingDoc(h: Omit<Holding, 'id'>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(holdingsCol(uid), clean(h as Record<string, unknown>));
}

export async function removeHoldingDoc(id: string): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(holdingsCol(uid), id));
}

export async function updateHoldingDoc(id: string, updates: Partial<Holding>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await updateDoc(doc(holdingsCol(uid), id), clean(updates as Record<string, unknown>));
}

// ---- Transactions ----
export async function addTransactionDoc(t: Omit<Transaction, 'id'>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(transactionsCol(uid), clean(t as Record<string, unknown>));
}

export async function removeTransactionDoc(id: string): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(transactionsCol(uid), id));
}

// ---- Alerts ----
export async function addAlertDoc(a: Omit<PriceAlert, 'id'>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(alertsCol(uid), clean(a as Record<string, unknown>));
}

export async function removeAlertDoc(id: string): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(alertsCol(uid), id));
}

export async function updateAlertDoc(id: string, updates: Partial<PriceAlert>): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await updateDoc(doc(alertsCol(uid), id), clean(updates as Record<string, unknown>));
}

// ---- RAG Documents ----

/**
 * Persists a RAG document's metadata and chunks to Firestore.
 *
 * The client-generated `id` is used as the Firestore document ID so that
 * chunk `documentId` references remain valid after round-tripping through
 * the database. The `content` field is intentionally omitted — it is large
 * (full raw text) and is only needed during chunking, which has already
 * happened by the time this function is called.
 */
export async function addRagDocumentDoc(ragDoc: RagDocument): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content: _content, id, ...data } = ragDoc;
  const ref = doc(ragDocumentsCol(uid), id);
  await setDoc(ref, clean(data as Record<string, unknown>));
}

export async function removeRagDocumentDoc(id: string): Promise<void> {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(ragDocumentsCol(uid), id));
}
