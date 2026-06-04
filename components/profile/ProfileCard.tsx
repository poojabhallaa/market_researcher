'use client';
import { Mail, Phone, MapPin, Pencil, BadgeCheck } from 'lucide-react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { Avatar } from '@/components/ui/Avatar';

interface ProfileCardProps {
  onEdit: () => void;
}

export function ProfileCard({ onEdit }: ProfileCardProps) {
  const { profile } = useProfileStore();

  const contact = [
    { icon: Mail, value: profile.email },
    { icon: Phone, value: profile.phone },
    { icon: MapPin, value: profile.location },
  ].filter((c) => c.value);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900">
      {/* Cover gradient */}
      <div className="h-24 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-violet-500/20" />

      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar
              name={profile.name}
              src={profile.avatar}
              size={84}
              className="ring-4 ring-zinc-900 shadow-xl"
            />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">{profile.name}</h2>
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-500">
                {profile.role}
                {profile.plan && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wide">
                    {profile.plan}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 self-start sm:self-auto bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-2xl">{profile.bio}</p>
        )}

        {/* Contact grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contact.map(({ icon: Icon, value }) => (
            <div
              key={value}
              className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/40 border border-zinc-800/60 rounded-lg"
            >
              <Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <span className="text-sm text-zinc-300 truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
