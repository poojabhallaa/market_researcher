'use client';
import { useRef, useState } from 'react';
import { X, Camera, Trash2, UserCog } from 'lucide-react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { Avatar } from '@/components/ui/Avatar';
import type { UserProfile } from '@/lib/types/profile';

interface ProfileEditModalProps {
  onClose: () => void;
}

const FIELDS: { key: keyof UserProfile; label: string; type?: string; placeholder?: string; full?: boolean }[] = [
  { key: 'name', label: 'Full Name', placeholder: 'Alex Morgan' },
  { key: 'role', label: 'Role / Title', placeholder: 'Portfolio Manager' },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (415) 555-0142' },
  { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
];

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const { profile, updateProfile, setAvatar } = useProfileStore();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => set('avatar', reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError('Name is required.');
      return;
    }
    updateProfile(draft);
    setAvatar(draft.avatar);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800/60 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-emerald-400" />
            Edit Profile
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Avatar uploader */}
          <div className="flex items-center gap-4">
            <Avatar name={draft.name} src={draft.avatar} size={72} />
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload photo
                </button>
                {draft.avatar && (
                  <button
                    type="button"
                    onClick={() => set('avatar', null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700/40 rounded-lg text-xs text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-600">JPG, PNG or GIF · up to 2 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          {/* Text fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  value={(draft[f.key] as string) ?? ''}
                  onChange={(e) => set(f.key, e.target.value as UserProfile[typeof f.key])}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Bio</label>
            <textarea
              value={draft.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              placeholder="A short description about you and your investing style."
              className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-700/40 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
