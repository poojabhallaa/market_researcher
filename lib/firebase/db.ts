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

/** Current user's uid, or null when signed out. */
export function currentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ---- Collection / document references (scoped per user) ----
export const userDocRef = (uid: string) => doc(db, 'users', uid);
export const holdingsCol = (uid: string) => collection(db, 'users', uid, 'holdings');
export const transactionsCol = (uid: string) => collection(db, 'users', uid, 'transactions');
export const alertsCol = (uid: string) => collection(db, 'users', uid, 'alerts');

/** Firestore rejects `undefined` values — drop them before writing. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

// ---- Profile ----
export async function writeProfile(profile: Partial<UserProfile>) {
  const uid = currentUid();
  if (!uid) return;
  await setDoc(userDocRef(uid), clean(profile), { merge: true });
}

// ---- Holdings ----
export async function addHoldingDoc(h: Omit<Holding, 'id'>) {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(holdingsCol(uid), clean(h));
}
export async function removeHoldingDoc(id: string) {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(holdingsCol(uid), id));
}
export async function updateHoldingDoc(id: string, updates: Partial<Holding>) {
  const uid = currentUid();
  if (!uid) return;
  await updateDoc(doc(holdingsCol(uid), id), clean(updates));
}

// ---- Transactions ----
export async function addTransactionDoc(t: Omit<Transaction, 'id'>) {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(transactionsCol(uid), clean(t));
}
export async function removeTransactionDoc(id: string) {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(transactionsCol(uid), id));
}

// ---- Alerts ----
export async function addAlertDoc(a: Omit<PriceAlert, 'id'>) {
  const uid = currentUid();
  if (!uid) return;
  await addDoc(alertsCol(uid), clean(a));
}
export async function removeAlertDoc(id: string) {
  const uid = currentUid();
  if (!uid) return;
  await deleteDoc(doc(alertsCol(uid), id));
}
export async function updateAlertDoc(id: string, updates: Partial<PriceAlert>) {
  const uid = currentUid();
  if (!uid) return;
  await updateDoc(doc(alertsCol(uid), id), clean(updates));
}
