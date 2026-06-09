'use client';
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  FileBarChart,
  Megaphone,
  ShieldCheck,
  Palette,
  Coins,
  RotateCcw,
} from 'lucide-react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import type { NotificationPreferences, UserProfile } from '@/lib/types/profile';

const CURRENCIES: { value: UserProfile['currency']; label: string }[] = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
];

const NOTIFICATIONS: { key: keyof NotificationPreferences; icon: typeof Bell; label: string; desc: string }[] = [
  { key: 'priceAlerts', icon: Bell, label: 'Price Alerts', desc: 'Notify me when a price alert is triggered' },
  { key: 'emailDigest', icon: Mail, label: 'Email Digest', desc: 'Daily summary of your portfolio activity' },
  { key: 'weeklyReport', icon: FileBarChart, label: 'Weekly Report', desc: 'Performance recap every Monday morning' },
  { key: 'productNews', icon: Megaphone, label: 'Product News', desc: 'Updates about new Finanalyst features' },
];

export default function SettingsPage() {
  const { profile, updateProfile, toggleNotification, reset } = useProfileStore();
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
          <SettingsIcon className="w-4 h-4 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Settings</h1>
          <p className="text-xs text-zinc-500">Manage your profile, preferences and notifications</p>
        </div>
      </div>

      <ProfileCard onEdit={() => setEditing(true)} />

      {/* Preferences */}
      <Section title="Preferences" icon={Palette}>
        <Row icon={Coins} label="Display Currency" desc="Used across portfolio, transactions and alerts">
          <select
            value={profile.currency}
            onChange={(e) => updateProfile({ currency: e.target.value as UserProfile['currency'] })}
            className="px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Row>
        <Row icon={Palette} label="Appearance" desc="Switch between light and dark theme" last>
          <ThemeToggle />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {NOTIFICATIONS.map((n, i) => (
          <Row
            key={n.key}
            icon={n.icon}
            label={n.label}
            desc={n.desc}
            last={i === NOTIFICATIONS.length - 1}
          >
            <Toggle on={profile.notifications[n.key]} onClick={() => toggleNotification(n.key)} />
          </Row>
        ))}
      </Section>

      {/* Security */}
      <Section title="Security" icon={ShieldCheck}>
        <Row icon={ShieldCheck} label="Two-Factor Authentication" desc="Add an extra layer of security to your account" last>
          <Toggle on={profile.twoFactor} onClick={() => updateProfile({ twoFactor: !profile.twoFactor })} />
        </Row>
      </Section>

      {/* Danger zone */}
      <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Reset profile</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Restore your name, contact details and preferences to their defaults.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset your profile to default values?')) reset();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {editing && <ProfileEditModal onClose={() => setEditing(false)} />}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Bell;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800/60">
        <Icon className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  desc,
  children,
  last,
}: {
  icon: typeof Bell;
  label: string;
  desc: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 py-4',
        !last && 'border-b border-zinc-800/60'
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200">{label}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        on ? 'bg-emerald-500' : 'bg-zinc-700'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
          on && 'translate-x-5'
        )}
      />
    </button>
  );
}
