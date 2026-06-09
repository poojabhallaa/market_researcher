'use client';
import { useEffect } from 'react';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  userDocRef,
  holdingsCol,
  transactionsCol,
  alertsCol,
} from '@/lib/firebase/db';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { useAlertsStore } from '@/lib/stores/alertsStore';
import { useProfileStore, DEFAULT_PROFILE } from '@/lib/stores/profileStore';
import type { Holding, Transaction } from '@/lib/types/portfolio';
import type { PriceAlert } from '@/lib/types/alerts';
import type { UserProfile } from '@/lib/types/profile';

/**
 * Subscribes to the signed-in user's Firestore data and keeps the local
 * zustand stores in sync. All portfolio, transaction, alert and profile data
 * is sourced from the database here — nothing is read from localStorage.
 */
export function DataSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const setHoldings = usePortfolioStore((s) => s.setHoldings);
  const setTransactions = usePortfolioStore((s) => s.setTransactions);
  const setAlerts = useAlertsStore((s) => s.setAlerts);
  const setProfile = useProfileStore((s) => s.setProfile);

  useEffect(() => {
    if (!user) {
      // Signed out — clear any data from the previous session.
      setHoldings([]);
      setTransactions([]);
      setAlerts([]);
      setProfile(DEFAULT_PROFILE);
      return;
    }

    const uid = user.uid;

    const unsubProfile = onSnapshot(userDocRef(uid), (snap) => {
      const data = snap.data() as Partial<UserProfile> | undefined;
      setProfile({
        ...DEFAULT_PROFILE,
        ...data,
        email: data?.email || user.email || '',
        notifications: {
          ...DEFAULT_PROFILE.notifications,
          ...data?.notifications,
        },
      });
    });

    const unsubHoldings = onSnapshot(holdingsCol(uid), (snap) => {
      setHoldings(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holding)
      );
    });

    const unsubTransactions = onSnapshot(
      query(transactionsCol(uid), orderBy('date', 'desc')),
      (snap) => {
        setTransactions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction)
        );
      }
    );

    const unsubAlerts = onSnapshot(
      query(alertsCol(uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setAlerts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PriceAlert)
        );
      }
    );

    return () => {
      unsubProfile();
      unsubHoldings();
      unsubTransactions();
      unsubAlerts();
    };
  }, [user, setHoldings, setTransactions, setAlerts, setProfile]);

  return <>{children}</>;
}
