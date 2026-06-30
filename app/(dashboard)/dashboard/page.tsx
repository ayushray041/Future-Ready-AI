'use client';

import {
  Zap,
  Target,
  FileText,
  Mic,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  BookOpen,
  Activity,
  Loader2,
  Briefcase,
} from 'lucide-react';

import StatCard from '@/components/shared/StatCard';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const ACTIVITY = [
  { icon: CheckCircle, color: 'text-emerald-400', text: 'Completed "Arrays & Hashing" module', time: '2h ago' },
  { icon: FileText,    color: 'text-blue-400',    text: 'Resume analyzed — score improved to 78', time: '5h ago' },
  { icon: Mic,         color: 'text-amber-400',   text: 'Mock interview completed — 82% accuracy', time: '1d ago' },
  { icon: Star,        color: 'text-cyan-400',    text: 'Applied to Google Summer of Code', time: '2d ago' },
  { icon: BookOpen,    color: 'text-indigo-400',  text: 'Started "ML Foundations" course', time: '3d ago' },
];

const ACTIONS = [
  { href: '/resume',   icon: FileText, label: 'Upload Resume',    desc: 'Get your ATS score', color: 'cyan'    },
  { href: '/mentor',   icon: Zap,      label: 'Chat with Mentor', desc: 'Get instant guidance', color: 'blue'   },
  { href: '/roadmap',  icon: Target,   label: 'View Roadmap',     desc: 'Track milestones', color: 'emerald' },
  { href: '/interview',icon: Mic,      label: 'Mock Interview',   desc: 'Practice now', color: 'amber'   },
];

type AccentColor = 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo';

const colorMap: Record<string, { bg: string; text: string }> = {
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400'    },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400'   },
};

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const careerScore = profile?.careerScore ?? 0;
  const streak       = profile?.streak ?? 0;
  const skillsCount  = profile?.skills.length ?? 0;
  const goalsCount   = profile?.goals.length ?? 0;
  const firstName    = profile?.displayName?.split(' ')[0] ?? 'there';

  const radarData = (profile?.skills.length
    ? profile.skills.slice(0, 6)
    : ['DSA', 'Dev', 'AI/ML', 'Cloud', 'Comm', 'Resume']
  ).map(skill => ({ skill, A: careerScore }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        description="Here's your career snapshot for today."
        badge="AI Career OS"
        action={
          <Link href="/mentor"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
              text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all">
            <Zap className="h-4 w-4" /> Ask AI Mentor
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Career Score"  value={careerScore}  sub="out of 100"    icon={Activity}  color="cyan"    />
        <StatCard title="Streak"        value={streak}       sub="days active"   icon={Zap}       color="amber"   />
        <StatCard title="Skills Mapped" value={skillsCount}  sub="tracked"       icon={BookOpen}  color="emerald" />
        <StatCard title="Goals Set"     value={goalsCount}   sub="career goals"  icon={Briefcase} color="blue"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career readiness gauge + radar */}
        <GlassCard className="lg:col-span-1 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Career Readiness</h3>

          {/* Circular gauge */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke="url(#g1)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(careerScore / 100) * 314} 314`} />
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{careerScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
          </div>

          {/* Radar */}
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Quick actions */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Quick Actions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Jump back into your workflow</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map(({ href, icon: Icon, label, desc, color }) => {
              const c = colorMap[color] || colorMap.cyan;
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${c.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500 truncate">{desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 ml-auto flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <a.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{a.text}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600">{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI recommended next steps */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300">AI Recommended Actions</h3>
          </div>
          <div className="space-y-3">
            {[
              { priority: 'HIGH',   label: 'Improve Communication score',  desc: 'Your weakest skill — 2 modules away from +10 pts', color: 'text-rose-400 bg-rose-500/10' },
              { priority: 'MEDIUM', label: 'Upload your latest resume',     desc: 'Last scan was 3 weeks ago — refresh for accuracy', color: 'text-amber-400 bg-amber-500/10' },
              { priority: 'MEDIUM', label: 'Complete Cloud certification',  desc: 'AWS Cloud Practitioner closes skill gap by 15%', color: 'text-amber-400 bg-amber-500/10' },
              { priority: 'LOW',    label: 'Join MLH Fellowship cohort',    desc: '81% match — applications open until Mar 1', color: 'text-blue-400 bg-blue-500/10' },
              { priority: 'LOW',    label: 'Schedule mock interview',       desc: 'You haven\'t practiced in 7 days', color: 'text-blue-400 bg-blue-500/10' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 ${a.color}`}>
                  {a.priority}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{a.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
