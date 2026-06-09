import { create } from 'zustand';
import type { PriceAlert } from '@/lib/types/alerts';
import { addAlertDoc, removeAlertDoc, updateAlertDoc } from '@/lib/firebase/db';

interface AlertsState {
  alerts: PriceAlert[];
  setAlerts: (a: PriceAlert[]) => void;
  addAlert: (a: Omit<PriceAlert, 'id' | 'active' | 'triggeredAt' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  markTriggered: (id: string, when: string) => void;
  resetTrigger: (id: string) => void;
}

export const useAlertsStore = create<AlertsState>()((set, get) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (a) =>
    void addAlertDoc({
      ...a,
      active: true,
      triggeredAt: null,
      createdAt: new Date().toISOString(),
    }),
  removeAlert: (id) => void removeAlertDoc(id),
  toggleAlert: (id) => {
    const alert = get().alerts.find((a) => a.id === id);
    if (alert) void updateAlertDoc(id, { active: !alert.active });
  },
  markTriggered: (id, when) =>
    void updateAlertDoc(id, { triggeredAt: when, active: false }),
  resetTrigger: (id) =>
    void updateAlertDoc(id, { triggeredAt: null, active: true }),
}));
