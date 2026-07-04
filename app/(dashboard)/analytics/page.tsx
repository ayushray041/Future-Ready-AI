'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Zap, Target, Activity, BarChart2 } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { getAnalytics, upsertAnalytics } from '@/services/analytics.service';
import { getTwin } from '@/services/career-twin.service';
import { fsQuery } from '@/services/firestore.service';
import { getResumeHistory } from '@/services/resume.service';
import type { AnalyticsData, CareerTwinData, MentorSession, ResumeAnalysis, UserProfile } from '@/types';

type TimeRange = '3m' | '6m' | '1y';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#334155'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 },
  labelStyle: { color: '#e2e8f0', fontSize: 12 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function monthLabel(date: Date) {
  return date.toLocaleString('default', { month: 'short' });
}

function monthMatches(dateValue: string | undefined, monthIndex: number) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const targetMonth = (currentMonth - monthIndex + 12) % 12;
  const targetYear = currentYear - (currentMonth - monthIndex < 0 ? 1 : 0);
  return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
}

function buildAnalyticsSnapshot(
  profile: UserProfile,
  resumeHistory: ResumeAnalysis[],
  mentorSessions: MentorSession[],
  twin: CareerTwinData | null,
  range: TimeRange,
): AnalyticsData {
  const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const now = new Date();

  const resumeAverage = resumeHistory.length
    ? Math.round(resumeHistory.reduce((sum, item) => sum + (item.atsScore ?? item.overallScore ?? 0), 0) / resumeHistory.length)
    : Math.max(40, profile.careerScore ?? 50);

  const mentorScore = clamp(
    45 + mentorSessions.length * 6 + mentorSessions.reduce((sum, session) => sum + session.messages.length, 0),
    40,
    95,
  );

  const twinScore = twin?.twinScore ? clamp(twin.twinScore, 40, 100) : 50;
  const careerScore = clamp(
    Math.round(profile.careerScore * 0.45 + resumeAverage * 0.3 + mentorScore * 0.15 + twinScore * 0.1),
    0,
    100,
  );

  const trend = Array.from({ length: months }, (_, index) => {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (months - 1 - index));
    const base = resumeHistory.length ? resumeAverage : profile.careerScore;
    const monthlyBoost = (index + 1) * 2;
    const sessionBoost = mentorSessions.filter((session) => monthMatches(session.updatedAt, months - 1 - index)).length * 2;
    const twinBoost = twin && monthMatches(twin.generatedAt, months - 1 - index) ? 4 : 0;
    const score = clamp(Math.round(base * 0.6 + monthlyBoost + sessionBoost + twinBoost), 0, 100);
    const target = 85;
    const peer = clamp(score + (index % 2 === 0 ? 5 : -3), 55, 95);
    return { month: monthLabel(date), score, target, peer };
  });

  const skillNames = Array.from(new Set([
    ...(profile.skills ?? []),
    ...resumeHistory.flatMap((item) => item.extractedSkills ?? []),
    ...(twin?.skillGap?.map((item) => item.skill) ?? []),
  ])).slice(0, 6);

  const skillScores = skillNames.map((skill, index) => {
    const inProfile = (profile.skills ?? []).includes(skill);
    const resumeHits = resumeHistory.filter((item) => item.extractedSkills?.includes(skill)).length;
    const gap = twin?.skillGap?.find((item) => item.skill === skill)?.gap ?? 0;
    const score = clamp(Math.round((inProfile ? 58 : 42) + resumeHits * 8 + (gap > 0 ? Math.max(0, 10 - gap) : 5) + index), 35, 95);
    return { skill, score };
  });

  const applications = Array.from({ length: months }, (_, index) => {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (months - 1 - index));
    const applied = resumeHistory.filter((item) => monthMatches(item.analyzedAt, months - 1 - index)).length + mentorSessions.filter((session) => monthMatches(session.updatedAt, months - 1 - index)).length;
    const interviews = clamp(Math.round(applied * 0.45 + (twin && monthMatches(twin.generatedAt, months - 1 - index) ? 2 : 0)), 0, 8);
    return { month: monthLabel(date), applied, interviews };
  });

  const interviewPerf = [
    { round: 'Resume Scan', score: clamp(Math.round(resumeAverage), 0, 100) },
    { round: 'Mentor Review', score: clamp(Math.round(mentorScore), 0, 100) },
    { round: 'Twin Match', score: clamp(Math.round(twinScore), 0, 100) },
    { round: 'Career Readiness', score: careerScore },
  ];

  const insights = [
    {
      emoji: '🚀',
      title: careerScore >= 80 ? 'Momentum is strong' : 'Momentum is building',
      body: `Your current career score is ${careerScore}/100 based on your profile, resume activity, mentor sessions, and career twin signals.`,
    },
    {
      emoji: '📈',
      title: skillScores[0] ? `${skillScores[0].skill} is your strongest signal` : 'Skill growth is visible',
      body: skillScores[0]
        ? `${skillScores[0].skill} is currently at ${skillScores[0].score}/100 and should stay central in your next learning sprint.`
        : 'Your profile data is still being shaped by recent activity and will improve with each new analysis.',
    },
    {
      emoji: '🎯',
      title: twin?.futureRoles?.length ? 'Twin recommendations are actionable' : 'Career focus is becoming clearer',
      body: twin?.futureRoles?.length
        ? `You have ${twin.futureRoles.length} role paths to review from your latest twin analysis.`
        : 'Your twin profile is not ready yet, but your existing metrics are enough to guide your next step.',
    },
    {
      emoji: '💡',
      title: resumeHistory.length ? 'Resume work is paying off' : 'More resume feedback will sharpen the picture',
      body: resumeHistory.length
        ? `You have ${resumeHistory.length} resume analysis${resumeHistory.length > 1 ? 'es' : ''} in the system, helping you track growth over time.`
        : 'Add a resume analysis to create a richer skill and readiness trend.',
    },
  ];

  return {
    uid: profile.uid,
    careerScore,
    careerTrend: trend,
    skillScores,
    applications,
    interviewPerf,
    insights,
    updatedAt: new Date().toISOString(),
  };
}

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [range, setRange] = useState<TimeRange>('6m');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!profile?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [existing, resumeHistory, mentorSessions, twin] = await Promise.all([
          getAnalytics(profile.uid),
          getResumeHistory(profile.uid),
          fsQuery<MentorSession>('mentorSessions', [['uid', '==', profile.uid]], 'updatedAt', 20),
          getTwin(profile.uid),
        ]);

        const next = buildAnalyticsSnapshot(profile, resumeHistory, mentorSessions, twin, range);
        await upsertAnalytics(profile.uid, next);
        setAnalytics(next);
      } catch (error) {
        console.error('[analytics] failed to load', error);
        const fallback = await getAnalytics(profile.uid);
        setAnalytics(fallback);
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, [profile?.uid, range]);

  const data = analytics ?? null;
  const pieData = (data?.skillScores ?? []).slice(0, 5).map((item) => ({ name: item.skill, value: item.score }));
  const statTrend = data?.careerTrend?.length ? data.careerTrend[data.careerTrend.length - 1] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Growth"
        description="Live insights powered by your profile, resume activity, mentor sessions, and twin results."
        badge="AI Insights"
        action={
          <div className="flex rounded-xl overflow-hidden border border-white/5">
            {(['3m', '6m', '1y'] as TimeRange[]).map((item) => (
              <button key={item} onClick={() => setRange(item)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors
                  ${range === item ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 bg-white/5'}`}>
                {item}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-400">
          Building your live analytics snapshot from Firestore...
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Score" value={data?.careerScore ?? 0} icon={Activity} color="cyan" trend={{ value: statTrend ? `+${Math.max(0, statTrend.score - (data?.careerTrend?.[0]?.score ?? 0))} pts` : 'Live', up: true }} />
        <StatCard title="Target Score" value="85" icon={Target} color="blue" sub="career target" />
        <StatCard title="Applications" value={data?.applications?.reduce((total, item) => total + item.applied, 0) ?? 0} icon={BarChart2} color="emerald" trend={{ value: 'from recent activity', up: true }} />
        <StatCard title="Interview Rate" value={`${Math.round(((data?.applications?.reduce((total, item) => total + item.interviews, 0) ?? 0) / Math.max(1, data?.applications?.reduce((total, item) => total + item.applied, 0) ?? 1)) * 100)}%`} icon={TrendingUp} color="amber" trend={{ value: 'based on current data', up: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Career Progress vs Target</h3>
          <p className="text-xs text-slate-500 mb-4">Score over time from your latest profile and activity data</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.careerTrend ?? []}>
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
              <Area type="monotone" dataKey="target" stroke="#334155" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Skill Proficiency</h3>
          <p className="text-xs text-slate-500 mb-4">Current scores by domain</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.skillScores ?? []} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="skill" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="score" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Application Tracking</h3>
          <p className="text-xs text-slate-500 mb-4">Applied vs interviews secured</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.applications ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="applied" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={14} name="Applied" />
              <Bar dataKey="interviews" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} name="Interviews" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Interview Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Score by round</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.interviewPerf ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="round" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={24}>
                {(data?.interviewPerf ?? []).map((_, index) => (
                  <Cell key={index} fill={['#06b6d4', '#3b82f6', '#6366f1', '#10b981'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={pieData} cx={35} cy={35} innerRadius={20} outerRadius={35} dataKey="value">
                {pieData.map((item, index) => <Cell key={item.name} fill={PIE_COLORS[index]} />)}
              </Pie>
            </PieChart>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[index] }} />
                  {item.name} ({item.value}%)
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">Live Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(data?.insights ?? []).map((insight, index) => (
            <div key={`${insight.title}-${index}`} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-xl">{insight.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{insight.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
