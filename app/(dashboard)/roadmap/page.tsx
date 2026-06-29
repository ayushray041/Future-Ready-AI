'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Lock, ChevronDown, ChevronUp, Zap, Map } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

type Status = 'done' | 'active' | 'locked';

interface Task {
  label: string;
  done: boolean;
  resource?: string;
}

interface Stage {
  id: string;
  period: string;
  title: string;
  status: Status;
  score: number;
  color: string;
  glow: string;
  tasks: Task[];
  skills: string[];
}

const STAGES: Stage[] = [
  {
    id: 's1', period: '1st Year', title: 'Foundations', status: 'done', score: 100,
    color: 'text-emerald-400', glow: 'bg-emerald-500',
    tasks: [
      { label: 'Python fundamentals', done: true },
      { label: 'HTML/CSS/JS basics', done: true },
      { label: 'DSA: Arrays, Strings, Linked Lists', done: true },
      { label: 'Git & GitHub', done: true },
    ],
    skills: ['Python', 'HTML', 'CSS', 'JavaScript', 'Git'],
  },
  {
    id: 's2', period: '2nd Year', title: 'Building Up', status: 'active', score: 65,
    color: 'text-cyan-400', glow: 'bg-cyan-500',
    tasks: [
      { label: 'React + Next.js', done: true },
      { label: 'Node.js + REST APIs', done: true },
      { label: 'DSA Advanced (Trees, Graphs)', done: false },
      { label: 'First Full-Stack Project', done: false },
      { label: 'Open Source Contribution', done: false },
    ],
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript'],
  },
  {
    id: 's3', period: '3rd Year', title: 'Specialise', status: 'locked', score: 0,
    color: 'text-slate-500', glow: 'bg-slate-600',
    tasks: [
      { label: 'ML/AI fundamentals', done: false },
      { label: 'PyTorch or TensorFlow', done: false },
      { label: 'Cloud certification (AWS/GCP)', done: false },
      { label: 'Internship secured', done: false },
      { label: 'Competitive programming (Codeforces)', done: false },
    ],
    skills: ['ML', 'PyTorch', 'AWS', 'System Design'],
  },
  {
    id: 's4', period: '4th Year', title: 'Ship It', status: 'locked', score: 0,
    color: 'text-slate-500', glow: 'bg-slate-600',
    tasks: [
      { label: 'Capstone AI project', done: false },
      { label: 'Portfolio website live', done: false },
      { label: 'Leetcode 200+ solved', done: false },
      { label: 'Mock interviews — top companies', done: false },
    ],
    skills: ['System Design', 'Portfolio', 'LeetCode'],
  },
  {
    id: 's5', period: 'Internship', title: 'Real World', status: 'locked', score: 0,
    color: 'text-slate-500', glow: 'bg-slate-600',
    tasks: [
      { label: 'Internship at product company', done: false },
      { label: 'Real codebase contribution', done: false },
      { label: 'PPO secured (target)', done: false },
      { label: 'Networking & LinkedIn active', done: false },
    ],
    skills: ['Industry Exp.', 'Networking'],
  },
  {
    id: 's6', period: 'Placement', title: 'Dream Job', status: 'locked', score: 0,
    color: 'text-slate-500', glow: 'bg-slate-600',
    tasks: [
      { label: 'Final round offer received', done: false },
      { label: 'Offer 10 LPA+', done: false },
      { label: 'AI Engineer / SDE role', done: false },
    ],
    skills: ['Offer', '10LPA+'],
  },
];

function RingProgress({ value, color }: { value: number; color: string }) {
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color === 'text-emerald-400' ? '#10b981' : color === 'text-cyan-400' ? '#06b6d4' : '#334155'}
        strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${(value / 100) * circ} ${circ}`} />
    </svg>
  );
}

export default function RoadmapPage() {
  const [expanded, setExpanded] = useState<string>('s2');

  const totalDone = STAGES.flatMap(s => s.tasks).filter(t => t.done).length;
  const totalTasks = STAGES.flatMap(s => s.tasks).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Roadmap"
        description="Your semester-by-semester path to your dream role."
        badge="AI Planned"
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5
            text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            <Zap className="h-4 w-4 text-cyan-400" /> Regenerate with AI
          </button>
        }
      />

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overall Progress', value: `${totalDone}/${totalTasks} tasks`, pct: Math.round(totalDone/totalTasks*100) + '%' },
          { label: 'Current Stage', value: 'Building Up (2nd Year)', pct: '65%' },
          { label: 'Estimated Completion', value: 'Apr 2027', pct: 'On track' },
        ].map((s, i) => (
          <GlassCard key={i} padding="sm">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-sm font-semibold text-white">{s.value}</p>
            <p className="text-xs text-cyan-400 mt-0.5">{s.pct}</p>
          </GlassCard>
        ))}
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => (
          <GlassCard key={stage.id} className="overflow-hidden !p-0">
            {/* Stage header */}
            <button
              onClick={() => setExpanded(expanded === stage.id ? '' : stage.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors">
              {/* Step indicator */}
              <div className="relative">
                {idx < STAGES.length - 1 && (
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3 mt-1
                    ${stage.status === 'done' ? 'bg-emerald-500/50' : 'bg-white/5'}`} />
                )}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center
                  ${stage.status === 'done' ? 'bg-emerald-500/20' : stage.status === 'active' ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                  {stage.status === 'done' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : stage.status === 'active' ? (
                    <Map className="h-5 w-5 text-cyan-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stage.period}</span>
                  {stage.status === 'active' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">In Progress</span>
                  )}
                  {stage.status === 'done' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Completed</span>
                  )}
                </div>
                <p className={`font-bold text-base ${stage.status === 'locked' ? 'text-slate-500' : 'text-white'}`}>{stage.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {stage.skills.map(s => (
                    <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${stage.status === 'locked' ? 'bg-white/5 text-slate-600' : 'bg-white/10 text-slate-400'}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ring */}
              <div className="relative flex-shrink-0">
                <RingProgress value={stage.score} color={stage.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${stage.color}`}>{stage.score}%</span>
                </div>
              </div>

              <div className="text-slate-600">
                {expanded === stage.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Tasks */}
            {expanded === stage.id && (
              <div className="border-t border-white/5 px-5 py-4">
                {stage.status === 'locked' && (
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Complete the previous stage to unlock these tasks.
                  </p>
                )}
                <div className="space-y-2">
                  {stage.tasks.map((task, i) => (
                    <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all
                      ${task.done ? 'bg-emerald-500/5' : stage.status === 'locked' ? 'opacity-40' : 'bg-white/5 hover:bg-white/10 cursor-pointer'}`}>
                      {task.done ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
