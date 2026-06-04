export interface NotificationPreferences {
  priceAlerts: boolean;
  emailDigest: boolean;
  weeklyReport: boolean;
  productNews: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string | null; // data URL, null = use initials
  plan: string;
  role: string;
  location: string;
  bio: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';
  twoFactor: boolean;
  notifications: NotificationPreferences;
}
