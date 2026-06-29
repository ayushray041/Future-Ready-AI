'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, Loader2, Zap, Target, BookOpen, Star, Rocket } from 'lucide-react';
import { createUser } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { updateUser } from '@/services/user.service';

const SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js',
  'Data Structures', 'Machine Learning', 'Deep Learning', 'SQL',
  'Cloud (AWS/GCP)', 'Docker', 'System Design', 'Git',
];

const GOALS = [
  { id: 'placement', label: 'Campus Placement', icon: '🏢' },
  { id: 'startup', label: 'Join a Startup', icon: '🚀' },
  { id: 'research', label: 'Research / PhD', icon: '🔬' },
  { id: 'product', label: 'Build a Product', icon: '⚙️' },
  { id: 'freelance', label: 'Freelancing', icon: '💻' },
  { id: 'abroad', label: 'Work Abroad', icon: '🌍' },
];

const SALARY = ['Under 5 LPA', '5–10 LPA', '10–20 LPA', '20–50 LPA', '50 LPA+'];

const STEPS = [
  { title: 'Your goals', icon: Target },
  { title: 'Your skills', icon: BookOpen },
  { title: 'Expectations', icon: Star },
  { title: "You're set!", icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [salary, setSalary] = useState('10–20 LPA');
  const [loading, setLoading] = useState(false);

  function toggleGoal(id: string) {
    setGoals(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id]);
  }
  function toggleSkill(s: string) {
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  }

  async function finish() {
  if (!firebaseUser) return;

  setLoading(true);

  try {
    await updateUser(firebaseUser.uid, {
      goals,
      skills,
      salaryExpectation: salary,
    });

    router.push('/dashboard');
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/5 blur-[80px]" />
        <div className="absolute bottom-0 right-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FutureReady AI</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all
                  ${i < step ? 'bg-cyan-500 text-white' : i === step ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50' : 'bg-white/5 text-slate-600'}`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-slate-600'}`}>{s.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {/* Step 0 — Goals */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">What&apos;s your primary goal?</h2>
              <p className="text-sm text-slate-400 mb-6">Select all that apply — we&apos;ll tailor your roadmap.</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all
                      ${goals.includes(g.id)
                        ? 'bg-cyan-500/10 ring-1 ring-cyan-500/40 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-sm font-medium">{g.label}</span>
                    {goals.includes(g.id) && <Check className="h-3.5 w-3.5 text-cyan-400 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Skills */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">What do you already know?</h2>
              <p className="text-sm text-slate-400 mb-6">We&apos;ll skip what you&apos;ve mastered and focus on gaps.</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${skills.includes(s)
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-600">{skills.length} selected</p>
            </div>
          )}

          {/* Step 2 — Salary */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Salary expectation</h2>
              <p className="text-sm text-slate-400 mb-6">This helps us suggest the right opportunities and roles.</p>
              <div className="space-y-3">
                {SALARY.map(s => (
                  <button key={s} onClick={() => setSalary(s)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all
                      ${salary === s
                        ? 'bg-cyan-500/10 ring-1 ring-cyan-500/40 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                    <span className="font-medium">{s}</span>
                    {salary === s && <Check className="h-4 w-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — All set */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20
                flex items-center justify-center mx-auto mb-5 ring-1 ring-cyan-500/30">
                <Rocket className="h-8 w-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set! 🎉</h2>
              <p className="text-sm text-slate-400 mb-6">
                Your AI career OS is ready. We&apos;ve built a personalized roadmap based on your goals,
                skills, and expectations.
              </p>
              <div className="bg-white/5 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-300">{goals.length} goals configured</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-300">{skills.length} skills mapped</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-300">Target salary: {salary}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex gap-3 mt-8 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
            {step > 0 && (
              <button onClick={() => setStep(p => p - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(p => p + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                  text-sm font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500
                  shadow-lg shadow-cyan-500/20">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                  text-sm font-semibold text-white transition-all disabled:opacity-60
                  shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4" /> Launch Dashboard</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
