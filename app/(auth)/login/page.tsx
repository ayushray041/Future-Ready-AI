'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';

function validate(email: string, password: string) {
  const errs: Record<string, string> = {};
  if (!email) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
  if (!password) errs.password = 'Password is required';
  else if (password.length < 6) errs.password = 'Minimum 6 characters';
  return errs;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setFirebaseError('');
    setLoading(true);
    try {
  await authService.signIn(email, password);
  router.push('/dashboard');
} catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Check your credentials.';
      setFirebaseError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full
          bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600
            flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FutureReady AI</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-xl p-8
          shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in to continue your career journey</p>

          {firebaseError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20
              text-rose-400 text-sm">
              {firebaseError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white
                  placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                  ${errors.email
                    ? 'border-rose-500/50 focus:ring-rose-500/30'
                    : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">Password</label>
                <Link href="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-10 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                    ${errors.password
                      ? 'border-rose-500/50 focus:ring-rose-500/30'
                      : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl
                bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                px-4 py-2.5 text-sm font-semibold text-white
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                disabled:opacity-60 disabled:cursor-not-allowed transition-all
                shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to FutureReady?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Trusted by 10,000+ students across 200+ colleges
        </p>
      </div>
    </div>
  );
}
