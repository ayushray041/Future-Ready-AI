'use client';

import { useEffect } from "react";
import type { CareerTwinData } from "@/types";
import { getTwin, saveTwin } from "@/services/career-twin.service";

import {useAuthContext} from "@/contexts/AuthContext";


import { useState } from 'react';
import {
  Users, TrendingUp, Zap, Target, ChevronRight,
  ArrowUp, ArrowDown, Minus, Brain, Star, Lock,
  BarChart2, Globe, CheckCircle,
} from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const SKILL_GAP = [
  { skill: 'DSA',            you: 82, twin: 91, gap: -9  },
  { skill: 'System Design',  you: 48, twin: 80, gap: -32 },
  { skill: 'ML/AI',          you: 65, twin: 87, gap: -22 },
  { skill: 'Cloud',          you: 55, twin: 82, gap: -27 },
  { skill: 'Communication',  you: 48, twin: 78, gap: -30 },
  { skill: 'React/Frontend', you: 74, twin: 80, gap: -6  },
  { skill: 'Open Source',    you: 40, twin: 72, gap: -32 },
];

const RADAR = [
  { skill: 'DSA',     you: 82, twin: 91 },
  { skill: 'System',  you: 48, twin: 80 },
  { skill: 'ML/AI',   you: 65, twin: 87 },
  { skill: 'Cloud',   you: 55, twin: 82 },
  { skill: 'Comm.',   you: 48, twin: 78 },
  { skill: 'Projects',you: 70, twin: 88 },
];

const TRAJECTORY = [
  { period: 'Now',      you: 74, target: 74, peer: 68 },
  { period: 'Q3 2025',  you: 80, target: 82, peer: 72 },
  { period: 'Q4 2025',  you: 85, target: 88, peer: 74 },
  { period: 'Q1 2026',  you: 88, target: 91, peer: 77 },
  { period: 'Q2 2026',  you: 91, target: 95, peer: 79 },
];

const FUTURE_ROLES = [
  { title: 'AI Engineer',        company: 'Top Product Co.',  probability: 91, salary: '18–30 LPA', timeline: '2 years',   match: 'high'   },
  { title: 'ML Engineer',        company: 'Unicorn Startup',  probability: 83, salary: '15–25 LPA', timeline: '18 months', match: 'high'   },
  { title: 'SWE (AI Focus)',     company: 'FAANG',            probability: 74, salary: '30–50 LPA', timeline: '2.5 years', match: 'medium' },
  { title: 'Research Engineer',  company: 'Research Lab',     probability: 58, salary: '20–35 LPA', timeline: '3 years',   match: 'medium' },
  { title: 'AI Product Manager', company: 'SaaS Company',     probability: 45, salary: '20–40 LPA', timeline: '3.5 years', match: 'low'    },
];

const TWINS = [
  { name: 'Priya S.',  college: 'IIT Bombay',  role: 'AI Engineer at Google',    score: 94, path: ['GSoC', 'Intern @ DeepMind', 'Google AI'] },
  { name: 'Rohan K.',  college: 'BITS Pilani',  role: 'ML Engineer at OpenAI',    score: 91, path: ['Research intern', 'Kaggle Expert', 'OpenAI'] },
  { name: 'Ananya M.', college: 'NIT Trichy',   role: 'SDE-II at Flipkart',       score: 88, path: ['Competitive Coding', 'Intern @ Flipkart', 'FTE'] },
];

const RECS = [
  { priority: 1, emoji: '🏗️', title: 'Build an end-to-end ML system',   impact: '+12 pts', effort: '6 weeks', desc: 'Your twin completed a Recommendation System project that boosted their ML score from 65 → 87. Build one using PyTorch + FastAPI + deployment.' },
  { priority: 2, emoji: '☁️', title: 'AWS Cloud Practitioner cert',        impact: '+8 pts',  effort: '3 weeks', desc: '78% of your twin cohort has cloud certifications. This single cert bridges your biggest skill gap with recruiters.' },
  { priority: 3, emoji: '🗣️', title: 'Join a debate / public speaking club',impact: '+7 pts', effort: '8 weeks', desc: 'Communication is your lowest-scored dimension. Toastmasters-style practice correlates with +20% interview success rate in your twin group.' },
  { priority: 4, emoji: '🌐', title: 'Contribute to an open-source AI project',impact: '+6 pts',effort: '4 weeks', desc: 'Hugging Face, LangChain, or LlamaIndex — open-source contribution signals practical ML skills to top-tier recruiters.' },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 },
  labelStyle: { color: '#e2e8f0', fontSize: 12 },
};

function GapArrow({ gap }: { gap: number }) {
  if (gap < -15) return <ArrowDown className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />;
  if (gap < -5)  return <Minus     className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
  return <ArrowUp className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />;
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function CareerTwinPage() {
  const {profile,loading} = useAuthContext();
  const [activeRole, setActiveRole] = useState(0);
  const [twin, setTwin] = useState<CareerTwinData | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
  if (!profile) return;

 async function loadTwin() {
  const data = await getTwin(profile!.uid);

  if (data) {
    setTwin(data);
    return; // 👈 ye line add karo
  }

  setGenerating(true);

  try {
    const res = await fetch("/api/career-twin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: profile!.uid,
        profile: {
          displayName: profile!.displayName,
          year: profile!.year,
          branch: profile!.branch,
          college: profile!.college,
          targetCareer: profile!.targetCareer,
          skills: profile!.skills,
          goals: profile!.goals,
          salaryExpectation: profile!.salaryExpectation,
        },
        resumeAnalysis: null,
      }),
    });

    const json = await res.json();

    await saveTwin(profile!.uid, json.twin);

    setTwin(json.twin);
  } finally {
    setGenerating(false);
  }
}

  loadTwin();
}, [profile]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!profile) {
  return <div>Please login</div>;
}

if (!twin) {
  return <div>Generating Career Twin...</div>;
}


  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Twin"
        description="Your digital career doppelgänger — built from 10,000+ anonymised student journeys matching your profile."
        badge="AI Digital Twin"
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
            text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all">
            <Zap className="h-4 w-4" /> Regenerate Twin
          </button>
        }
      />

      {/* Twin identity + overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Twin card */}
        <GlassCard className="ring-1 ring-cyan-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600
                flex items-center justify-center text-white font-bold text-lg">
                AI
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500
                flex items-center justify-center ring-2 ring-slate-900">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Your Career Twin</p>
              <p className="text-base font-bold text-white">Twin #{twin.twinId}</p>
          
              <p className="text-xs text-cyan-400">{twin.matchPercent}% profile match</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              ['Background', 'CSE, 2nd Year, Tier-2 NIT'],
              ['Target',     'AI Engineer'],
              ['Twin\'s Role', 'ML Engineer @ Google'],
              ['Time taken',  '2.3 years from your stage'],
              ['Twin Score',  '94 / 100'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
                <span className="text-slate-500 flex-shrink-0">{k}</span>
                <span className="text-slate-200 font-medium text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-cyan-400 font-semibold">Twin&apos;s success factors: </span>
              GSoC in 2nd year, AWS cert before 3rd year, 200+ LeetCode problems, strong ML project portfolio.
            </p>
          </div>
        </GlassCard>

        {/* Radar comparison */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Skill Comparison</h3>
              <p className="text-xs text-slate-500 mt-0.5">You vs your Career Twin</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-400" /> You</span>
              <span className="flex items-center gap-1.5 text-indigo-400"><span className="h-2 w-2 rounded-full bg-indigo-400" /> Twin</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar dataKey="you"  stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="You" />
              <Radar dataKey="twin" stroke="#6366f1" fill="#6366f1" fillOpacity={0.10} name="Twin" />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Skill gap breakdown */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Skill Gap Analysis</h3>
        <div className="space-y-3">
          {SKILL_GAP.map(item => (
            <div key={item.skill}>
              <div className="flex items-center gap-3 mb-1.5">
                <GapArrow gap={item.gap} />
                <span className="text-sm text-white font-medium w-36 flex-shrink-0">{item.skill}</span>
                <div className="flex-1 relative h-2 rounded-full bg-white/5 overflow-hidden">
                  {/* You */}
                  <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                    style={{ width: `${item.you}%` }} />
                  {/* Twin marker */}
                  <div className="absolute top-0 h-full w-0.5 bg-indigo-400 opacity-60"
                    style={{ left: `${item.twin}%` }} />
                </div>
                <div className="flex gap-3 text-xs flex-shrink-0 w-24 justify-end">
                  <span className="text-cyan-400 font-semibold">{item.you}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-indigo-400 font-semibold">{item.twin}</span>
                </div>
                <span className={`text-xs font-bold w-8 flex-shrink-0 text-right
                  ${item.gap < -15 ? 'text-rose-400' : item.gap < -5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {item.gap}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Your score</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-indigo-400 opacity-60" /> Twin score</span>
          <span className="ml-auto">Gap = you − twin</span>
        </div>
      </GlassCard>

      {/* Trajectory + future roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career trajectory */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Predicted Trajectory</h3>
          <p className="text-xs text-slate-500 mb-4">
  Your projected score vs twin&apos;s path
</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TRAJECTORY}>
              <defs>
                <linearGradient id="gYou" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="you"    stroke="#06b6d4" fill="url(#gYou)"    strokeWidth={2} name="You (projected)" />
              <Area type="monotone" dataKey="target" stroke="#6366f1" fill="url(#gTarget)" strokeWidth={1.5} strokeDasharray="5 3" name="Twin path" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Future role probabilities */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Future Role Predictions</h3>
          <div className="space-y-3">
            {FUTURE_ROLES.map((role, i) => (
              <button key={i} onClick={() => setActiveRole(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                  ${activeRole === i ? 'bg-cyan-500/10 ring-1 ring-cyan-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{role.title}</p>
                  <p className="text-xs text-slate-500">{role.company} · {role.salary}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${role.probability >= 75 ? 'text-emerald-400' : role.probability >= 55 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {role.probability}%
                  </p>
                  <p className="text-xs text-slate-600">{role.timeline}</p>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Real twin profiles */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Students Who Walked This Path</h3>
          <span className="text-xs text-slate-500">Anonymised profiles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TWINS.map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30
                  flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.college}</p>
                </div>
              </div>
              <p className="text-xs text-emerald-400 font-medium mb-2">{t.role}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.path.map((p, j) => (
                  <span key={j} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">
                    {j < t.path.length - 1 ? <CheckCircle className="h-2.5 w-2.5 text-emerald-400" /> : <Star className="h-2.5 w-2.5 text-cyan-400" />}
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Personalised recommendations */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-5">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">
  Personalised Recommendations from Your Twin&apos;s Journey
</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RECS.map(rec => (
            <div key={rec.priority}
              className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{rec.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-slate-500">#{rec.priority}</span>
                    <p className="text-sm font-semibold text-white">{rec.title}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.desc}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3" /> {rec.impact}
                    </span>
                    <span className="text-xs text-slate-500">{rec.effort}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 flex-shrink-0 mt-0.5 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
