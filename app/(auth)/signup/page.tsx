'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { createUser } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';

const CAREER_OPTIONS = [
  'AI Engineer', 'Software Engineer', 'Data Scientist',
  'ML Engineer', 'Full Stack Developer', 'Cloud Engineer',
  'DevOps Engineer', 'Product Manager',
];

function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
    .filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  return password ? (
    <div className="mt-1.5">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 rounded-full ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      {score > 0 && <p className={`text-xs mt-1 ${score < 2 ? 'text-rose-400' : score < 4 ? 'text-amber-400' : 'text-emerald-400'}`}>{labels[score]}</p>}
    </div>
  ) : null;
}

export default function SignupPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', year: '2nd Year', career: 'AI Engineer', branch: 'CSE',
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  function set(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFirebaseError('');
    setLoading(true);
    try {
      const cred = await authService.signUp(
        form.email,
        form.password
      );

      await createUser({
        uid: cred.user.uid,
        displayName: form.name,
        email: form.email,

        college: form.college,
        year: form.year,
        branch: form.branch,

        targetCareer: form.career,

        salaryExpectation: '',
        skills: [],
        goals: [],

        careerScore: 0,
        streak: 0,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      router.push('/onboarding');
    } catch (err: unknown) {
      setFirebaseError(err instanceof Error ? err.message : 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full
          bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FutureReady AI</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step >= s ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-white' : 'text-slate-500'}`}>
                {s === 1 ? 'Account' : 'Profile'}
              </span>
              {s < 2 && <div className={`h-px w-8 ${step > s ? 'bg-cyan-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
              <p className="text-sm text-slate-400 mb-6">Start your AI-powered career journey</p>

              {firebaseError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {firebaseError}
                </div>
              )}

              <form onSubmit={handleNext} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Ayush Sharma"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                      ${errors.name ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`} />
                  {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                      ${errors.email ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`} />
                  {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                        ${errors.password ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <StrengthBar password={form.password} />
                  {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors
                      ${errors.confirmPassword ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/5 focus:ring-cyan-500/40 focus:border-cyan-500/30'}`} />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl
                    bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                    px-4 py-2.5 text-sm font-semibold text-white transition-all
                    shadow-lg shadow-cyan-500/20">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Your profile</h1>
              <p className="text-sm text-slate-400 mb-6">Help us personalize your career path</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">College / University</label>
                  <input value={form.college} onChange={e => set('college', e.target.value)}
                    placeholder="IIT Delhi"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
                    <select value={form.year} onChange={e => set('year', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40">
                      {['1st Year','2nd Year','3rd Year','4th Year'].map(y => (
                        <option key={y} value={y} className="bg-slate-900">{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Branch</label>
                    <select value={form.branch} onChange={e => set('branch', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40">
                      {['CSE','IT','ECE','EEE','Mechanical','Civil','Data Science','AI & ML'].map(b => (
                        <option key={b} value={b} className="bg-slate-900">{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Target career</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAREER_OPTIONS.map(c => (
                      <button key={c} type="button" onClick={() => set('career', c)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all
                          ${form.career === c
                            ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                            : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl
                      bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                      px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
