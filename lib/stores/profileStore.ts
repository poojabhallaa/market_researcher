import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, NotificationPreferences } from '@/lib/types/profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@financeai.com',
  phone: '+1 (415) 555-0142',
  avatar: null,
  plan: 'Pro Plan',
  role: 'Portfolio Manager',
  location: 'San Francisco, CA',
  bio: 'Long-term investor focused on tech and clean energy. Tracking 12 positions across global markets.',
  currency: 'USD',
  twoFactor: false,
  notifications: {
    priceAlerts: true,
    emailDigest: true,
    weeklyReport: false,
    productNews: true,
  },
};

interface ProfileState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatar: (dataUrl: string | null) => void;
  toggleNotification: (key: keyof NotificationPreferences) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      setAvatar: (dataUrl) =>
        set((state) => ({ profile: { ...state.profile, avatar: dataUrl } })),
      toggleNotification: (key) =>
        set((state) => ({
          profile: {
            ...state.profile,
            notifications: {
              ...state.profile.notifications,
              [key]: !state.profile.notifications[key],
            },
          },
        })),
      reset: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: 'financeai-profile' }
  )
);

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const CURRENCY_SYMBOLS: Record<UserProfile['currency'], string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
};
