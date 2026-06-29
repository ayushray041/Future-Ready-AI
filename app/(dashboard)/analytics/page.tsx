'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Zap, Target, Activity, BarChart2 } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const careerProgress = [
  { month: 'Jan', score: 45, target: 80 }, { month: 'Feb', score: 52, target: 80 },
  { month: 'Mar', score: 58, target: 80 }, { month: 'Apr', score: 63, target: 80 },
  { month: 'May', score: 70, target: 80 }, { month: 'Jun', score: 74, target: 80 },
];

const skillGrowth = [
  { skill: 'DSA', score: 82 }, { skill: 'React', score: 74 }, { skill: 'AI/ML', score: 65 },
  { skill: 'Cloud', score: 55 }, { skill: 'System Design', score: 48 }, { skill: 'Node.js', score: 70 },
];

const applications = [
  { month: 'Jan', applied: 0, interviews: 0 }, { month: 'Feb', applied: 1, interviews: 0 },
  { month: 'Mar', applied: 2, interviews: 1 }, { month: 'Apr', applied: 3, interviews: 2 },
  { month: 'May', applied: 4, interviews: 2 }, { month: 'Jun', applied: 6, interviews: 3 },
];

const interviewPerf = [
  { round: 'OA Round', score: 88 }, { round: 'Technical 1', score: 75 },
  { round: 'Technical 2', score: 70 }, { round: 'HR Round', score: 92 },
];

const pieData = [
  { name: 'DSA', value: 30 }, { name: 'Projects', value: 25 },
  { name: 'AI/ML', value: 20 }, { name: 'Communication', value: 15 }, { name: 'Other', value: 10 },
];
const PIE_COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#334155'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 },
  labelStyle: { color: '#e2e8f0', fontSize: 12 },
};

const AI_INSIGHTS = [
  { emoji: '🚀', title: 'On track for top-10% placement',  body: 'If you maintain current velocity, you\'ll hit 85 score by October — qualifying for top-tier campus drives.' },
  { emoji: '⚠️', title: 'System Design is your biggest gap', body: 'Ranked 48/100 while peer average is 62. Two targeted projects can close this gap in 6 weeks.' },
  { emoji: '📈', title: 'Interview conversion is improving', body: 'You\'ve gone from 0% to 50% interview conversion rate in 6 months — keep up the mock practice.' },
  { emoji: '💡', title: 'Cloud certification would boost score +8', body: 'AWS Cloud Practitioner takes ~20 hrs. Your current trajectory suggests you can add it by August.' },
];

type TimeRange = '3m' | '6m' | '1y';

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('6m');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Growth"
        description="Data-driven insights into your career trajectory."
        badge="AI Insights"
        action={
          <div className="flex rounded-xl overflow-hidden border border-white/5">
            {(['3m', '6m', '1y'] as TimeRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors
                  ${range === r ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 bg-white/5'}`}>
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Score" value="74"   icon={Activity}  color="cyan"    trend={{ value: '+29 pts in 6 months', up: true }} />
        <StatCard title="Target Score"  value="85"   icon={Target}    color="blue"    sub="by Oct 2025" />
        <StatCard title="Applications"  value="6"    icon={BarChart2} color="emerald" trend={{ value: '+3 this month', up: true }} />
        <StatCard title="Interview Rate" value="50%" icon={TrendingUp} color="amber"  trend={{ value: '+50% vs last month', up: true }} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career progress */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Career Progress vs Target</h3>
          <p className="text-xs text-slate-500 mb-4">Score over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={careerProgress}>
              <defs>
                <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#gScore)" strokeWidth={2} name="Your score" />
              <Line type="monotone" dataKey="target" stroke="#334155" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Skill growth */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Skill Proficiency</h3>
          <p className="text-xs text-slate-500 mb-4">Current scores by domain</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={skillGrowth} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="skill" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="score" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Applications */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Application Tracking</h3>
          <p className="text-xs text-slate-500 mb-4">Applied vs interviews secured</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={applications}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="applied"    fill="#06b6d4" radius={[4,4,0,0]} barSize={14} name="Applied" />
              <Bar dataKey="interviews" fill="#3b82f6" radius={[4,4,0,0]} barSize={14} name="Interviews" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Interview performance */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Interview Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Score by round</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={interviewPerf}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="round" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="score" radius={[4,4,0,0]} barSize={24}>
                {interviewPerf.map((_, i) => (
                  <Cell key={i} fill={['#06b6d4','#3b82f6','#6366f1','#10b981'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Focus distribution */}
          <div className="mt-4 flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={pieData} cx={35} cy={35} innerRadius={20} outerRadius={35} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI insights */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">AI-Generated Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AI_INSIGHTS.map((ins, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-xl">{ins.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{ins.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
