'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton, authErrorMessage } from '@/components/auth/AuthShared';

export default function LoginPage() {
  const { user, loading, logIn, logInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await logIn(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      await logInWithGoogle();
      router.replace('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Finanalyst logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover mb-3"
            priority
          />
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your Finanalyst account</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 space-y-5">
          <GoogleButton onClick={handleGoogle} disabled={busy} label="Continue with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800/60 border border-zinc-700/40 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
      />
    </div>
  );
}
