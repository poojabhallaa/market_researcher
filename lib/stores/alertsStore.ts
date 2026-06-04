import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriceAlert } from '@/lib/types/alerts';

interface AlertsState {
  alerts: PriceAlert[];
  addAlert: (a: Omit<PriceAlert, 'id' | 'active' | 'triggeredAt' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  markTriggered: (id: string, when: string) => void;
  resetTrigger: (id: string) => void;
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (a) =>
        set((state) => ({
          alerts: [
            {
              ...a,
              id: crypto.randomUUID(),
              active: true,
              triggeredAt: null,
              createdAt: new Date().toISOString(),
            },
            ...state.alerts,
          ],
        })),
      removeAlert: (id) =>
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, active: !a.active } : a
          ),
        })),
      markTriggered: (id, when) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggeredAt: when, active: false } : a
          ),
        })),
      resetTrigger: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggeredAt: null, active: true } : a
          ),
        })),
    }),
    { name: 'financeai-alerts' }
  )
);
