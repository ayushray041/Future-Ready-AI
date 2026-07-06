'use client';
// app/(dashboard)/resume/page.tsx
// Resume Analyzer — real Gemini analysis via /api/resume,
// Firestore history, drag-and-drop upload. No demo data.

import { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, XCircle,
  Loader2, Zap, Download, Clock, RotateCcw,
} from 'lucide-react';
import GlassCard      from '@/components/shared/GlassCard';
import PageHeader     from '@/components/shared/PageHeader';
import { useResume }      from '@/hooks/useResume';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ResumeAnalysis } from '@/types';

const TARGET_ROLES = [
  'AI Engineer', 'Software Engineer', 'Data Scientist', 'ML Engineer',
  'Full Stack Developer', 'Cloud Engineer', 'DevOps Engineer', 'Product Manager',
];

const STATUS_ICON = {
  good: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  ok:   <AlertCircle  className="h-4 w-4 text-amber-400" />,
  bad:  <XCircle      className="h-4 w-4 text-rose-400"  />,
};
const BAR_COLOR = {
  good: 'from-emerald-500 to-emerald-400',
  ok:   'from-amber-500 to-amber-400',
  bad:  'from-rose-500 to-rose-400',
};
const SCORE_TEXT = { good: 'text-emerald-400', ok: 'text-amber-400', bad: 'text-rose-400' };

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
  const circ  = 2 * Math.PI * 50;
  return (
    <div className="relative h-32 w-32 mx-auto">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function HistoryItem({
  item, active, onSelect,
}: {
  item: ResumeAnalysis;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
        ${active
          ? 'bg-cyan-500/10 ring-1 ring-cyan-500/20'
          : 'bg-white/5 hover:bg-white/10'}`}>
      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{item.fileName}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <Clock className="h-2.5 w-2.5" />
          {new Date(item.analyzedAt).toLocaleDateString()}
        </p>
      </div>
      <span className={`text-xs font-bold flex-shrink-0
        ${item.overallScore >= 80 ? 'text-emerald-400' : item.overallScore >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
        {item.overallScore}
      </span>
    </button>
  );
}

export default function ResumePage() {
  const { firebaseUser, profile, loading: authLoading } = useAuthContext();

  const {
    analysis,
    history,
    loading,
    error,
    analyzeFile,
    loadHistory,
    selectItem,
  } = useResume();
  const [dragOver,    setDragOver]    = useState(false);
  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [targetRole,  setTargetRole]  = useState('AI Engineer');
  const inputRef = useRef<HTMLInputElement>(null);

  const uid       = firebaseUser?.uid ?? '';
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const displayed = activeId
    ? (history.find(h => h.id === activeId) ?? analysis)
    : analysis;

  useEffect(() => {
    if (uid) loadHistory(uid);
  }, [uid, loadHistory]);

  useEffect(() => {
  if (analysis && activeId !== analysis.id) {
    setActiveId(analysis.id);
  }
}, [analysis, activeId]);

  // Default target role to user's target career
  useEffect(() => {
  if (
    profile?.targetCareer &&
    targetRole !== profile.targetCareer
  ) {
    setTargetRole(profile.targetCareer);
  }
}, [profile?.targetCareer, targetRole]);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }
    if (!uid) {
      alert('Please sign in before analysing your resume.');
      return;
    }
    await analyzeFile(file, uid, targetRole);
  }

  function exportReport() {
    if (!displayed) return;

    const lines = [
      `Resume Report - ${displayed.fileName}`,
      `Analyzed At: ${new Date(displayed.analyzedAt).toLocaleString()}`,
      `Overall Score: ${displayed.overallScore}/100`,
      `ATS Score: ${displayed.atsScore}/100`,
      '',
      'Section Analysis:',
      ...displayed.sections.map(section => `- ${section.label}: ${section.score}/100 (${section.status}) - ${section.feedback}`),
      '',
      'Skills Found:',
      ...displayed.extractedSkills.map(skill => `- ${skill}`),
      '',
      'Missing Skills:',
      ...displayed.missingSkills.map(skill => `- ${skill}`),
      '',
      'Improvement Suggestions:',
      ...displayed.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${displayed.fileName.replace(/\.pdf$/i, '') || 'resume-report'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Analyzer"
        description="AI-powered ATS scoring, skill extraction, and personalised improvement suggestions."
        badge="Powered by Gemini"
        action={displayed ? (
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5
              text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
        ) : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Target role selector */}
          <GlassCard padding="sm">
            <label className="block text-xs text-slate-500 mb-1.5">
              Target Role (calibrates ATS keywords)
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                focus:outline-none focus:ring-1 focus:ring-cyan-500/40">
              {TARGET_ROLES.map(r => (
                <option key={r} value={r} className="bg-slate-900">{r}</option>
              ))}
            </select>
          </GlassCard>

          {/* Upload area */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Upload Resume</h3>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-cyan-500/60 bg-cyan-500/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {loading ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  <p className="text-sm text-slate-300">Analysing with Gemini…</p>
                  <p className="text-xs text-slate-500">Usually 5–15 seconds</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Drop PDF here</p>
                  <p className="text-xs text-slate-600 mt-1">or click to browse · Max 5 MB</p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10
                border border-rose-500/20 text-rose-400 text-xs">
                <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </GlassCard>

          {/* Score ring */}
          {displayed && (
            <GlassCard className="text-center">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Overall Score</h3>
              <ScoreRing score={displayed.overallScore} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{displayed.atsScore}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">ATS Score</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">
                    {displayed.overallScore >= 80 ? 'Strong' : displayed.overallScore >= 65 ? 'Good' : 'Needs Work'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Rating</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* History */}
          {history.length > 0 && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Resume History</h3>
              <div className="space-y-2">
                {history.map(h => (
                  <HistoryItem
                    key={h.id}
                    item={h}
                    active={activeId === h.id}
                    onSelect={() => { setActiveId(h.id); selectItem(h); }}
                  />
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── Right column: analysis ── */}
        <div className="lg:col-span-2 space-y-4">
          {!displayed ? (
            <GlassCard className="text-center py-24">
              <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No resume analysed yet</p>
              <p className="text-slate-600 text-sm mt-1">Upload a PDF to get real AI-powered analysis</p>
            </GlassCard>
          ) : (
            <>
              {/* Section analysis */}
              <GlassCard>
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Section Analysis</h3>
                <div className="space-y-4">
                  {displayed.sections.map(sec => (
                    <div key={sec.label}>
                      <div className="flex items-center gap-3 mb-1.5">
                        {STATUS_ICON[sec.status]}
                        <span className="text-sm font-medium text-white flex-1">{sec.label}</span>
                        <span className={`text-sm font-bold ${SCORE_TEXT[sec.status]}`}>
                          {sec.score}/100
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 mb-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${BAR_COLOR[sec.status]} transition-all`}
                          style={{ width: `${sec.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 ml-7">{sec.feedback}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Skills extracted / missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" /> Skills Found
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {displayed.extractedSkills.map(s => (
                      <span key={s}
                        className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" /> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {displayed.missingSkills.map(s => (
                      <span key={s}
                        className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                        + {s}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* AI suggestions */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-300">
                    AI Improvement Suggestions
                  </h3>
                </div>
                <ol className="space-y-3">
                  {displayed.suggestions.map((s, i) => (
                    <li key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <span
                        className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold
                          flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ol>
              </GlassCard>

              {/* Re-analyse */}
              <div className="flex justify-end">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5
                    text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <RotateCcw className="h-4 w-4" /> Analyse updated version
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}