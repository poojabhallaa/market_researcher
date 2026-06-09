import { create } from 'zustand';
import type { UserProfile, NotificationPreferences } from '@/lib/types/profile';
import { writeProfile } from '@/lib/firebase/db';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Investor',
  email: '',
  phone: '',
  avatar: null,
  plan: 'Free Plan',
  role: 'Investor',
  location: '',
  bio: '',
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
  // Hydrated by the Firestore sync layer:
  setProfile: (p: UserProfile) => void;
  // Writes go to Firestore and update local state optimistically.
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatar: (dataUrl: string | null) => void;
  toggleNotification: (key: keyof NotificationPreferences) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: DEFAULT_PROFILE,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => {
    set((state) => ({ profile: { ...state.profile, ...updates } }));
    void writeProfile(updates);
  },
  setAvatar: (avatar) => {
    set((state) => ({ profile: { ...state.profile, avatar } }));
    void writeProfile({ avatar });
  },
  toggleNotification: (key) => {
    const next = !get().profile.notifications[key];
    set((state) => ({
      profile: {
        ...state.profile,
        notifications: { ...state.profile.notifications, [key]: next },
      },
    }));
    void writeProfile({
      notifications: { ...get().profile.notifications, [key]: next },
    });
  },
  reset: () => {
    // Preserve identity tied to the auth account, reset everything else.
    const { name, email } = get().profile;
    const restored = { ...DEFAULT_PROFILE, name, email };
    set({ profile: restored });
    void writeProfile(restored);
  },
}));

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
