'use client';
// app/(dashboard)/mentor/page.tsx
// AI Mentor page wired to useMentor (Gemini + Firestore persistence).
// User profile comes from AuthContext — no demo data.

import { useState, useRef, useEffect } from 'react';
import {
  Send, Zap, User, RotateCcw, Lightbulb, AlertCircle, Loader2,
} from 'lucide-react';
import GlassCard        from '@/components/shared/GlassCard';
import PageHeader       from '@/components/shared/PageHeader';
import { useMentor }        from '@/hooks/useMentor';
import { useAuthContext }   from '@/contexts/AuthContext';

const SUGGESTIONS = [
  'What skills should I focus on for my target role?',
  'How do I prepare for FAANG interviews?',
  'Review my learning path and suggest improvements',
  'What open-source projects should I contribute to?',
  'How can I improve my resume ATS score?',
  'Explain System Design in simple terms',
  'What internships should I apply for this semester?',
  'How do I negotiate a salary offer?',
];

const QUICK_TOPICS = [
  { emoji: '🎯', title: 'Interview Prep',  desc: 'Tailored questions by company & role',  prompt: 'Give me a 4-week interview prep plan for my target career at top product companies' },
  { emoji: '🗺️', title: 'Roadmap Review', desc: 'AI analysis of your current path',      prompt: 'Analyse my skills and give me an optimised learning roadmap for my target career' },
  { emoji: '📄', title: 'Resume Coach',   desc: 'ATS tips & line-by-line feedback',       prompt: 'What are the top 5 resume improvements I should make for my target role?' },
  { emoji: '💡', title: 'Skill Gap',      desc: "What you're missing for your target",   prompt: 'Based on my profile, which skills am I missing most for my target career?' },
];

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1 px-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-2 w-2 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    const html = line
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/^#{1,3}\s+/, '')
      .replace(/^[-•*]\s+/, '• ');
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

export default function MentorPage() {
  const { firebaseUser, profile, loading: authLoading } = useAuthContext();
  const {
    messages, loading, error, sessionReady,
    sendMessage, clearChat, initSession,
  } = useMentor(profile);

  const [input,   setInput]   = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (firebaseUser?.uid && !authLoading) {
      initSession(firebaseUser.uid);
    }
  }, [firebaseUser?.uid, authLoading, initSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;
    setInput('');
    await sendMessage(text);
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Mentor"
        description="Context-aware career guidance powered by Gemini — personalised to your profile, skills, and goals."
        badge="Powered by Gemini"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Chat panel ── */}
        <div className="lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: 520 }}>
          <GlassCard className="flex flex-col flex-1 overflow-hidden !p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Career Mentor AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${sessionReady ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <p className={`text-xs ${sessionReady ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sessionReady ? 'Online · Gemini 1.5 Flash' : 'Connecting…'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5
                  text-xs text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20
                    flex items-center justify-center mb-4 ring-1 ring-cyan-500/20">
                    <Zap className="h-7 w-7 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Hi {profile?.displayName?.split(' ')[0] ?? 'there'} 👋
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                    I&apos;m your AI Mentor. I know your profile, career goals, and skill gaps.
                    Ask me anything about your career journey.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-sm">
                    {SUGGESTIONS.slice(0, 4).map(s => (
                      <button key={s} onClick={() => handleSend(s)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400
                          hover:text-slate-200 hover:bg-white/10 transition-all text-left leading-snug">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center
                    ${msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                    {msg.role === 'assistant'
                      ? <Zap  className="h-3.5 w-3.5 text-white" />
                      : <User className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 space-y-1
                    ${msg.role === 'assistant'
                      ? 'bg-white/5 rounded-tl-sm'
                      : 'bg-cyan-500/15 rounded-tr-sm ring-1 ring-cyan-500/20'}`}>
                    {renderContent(msg.content)}
                    <p className="text-xs text-slate-600 pt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600
                    flex items-center justify-center flex-shrink-0">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestion strip (shown after first message) */}
            {messages.length > 0 && (
              <div className="px-5 py-2 border-t border-white/5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSend(s)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10
                        text-xs text-slate-400 hover:text-slate-200 transition-all border border-white/5">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input row */}
            <div className="px-5 py-4 border-t border-white/5">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
                  placeholder="Ask your mentor anything…"
                  disabled={loading || !sessionReady}
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading || !sessionReady}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600
                    flex items-center justify-center text-white disabled:opacity-40
                    hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex-shrink-0">
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-300">Quick Topics</h3>
            </div>
            <div className="space-y-2">
              {QUICK_TOPICS.map((c, i) => (
                <button key={i} onClick={() => handleSend(c.prompt)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left">
                  <span className="text-lg">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">My Context</h3>
            <div className="space-y-0">
              {profile ? [
                ['Name',         profile.displayName],
                ['Year',         `${profile.year} · ${profile.branch}`],
                ['Target',       profile.targetCareer],
                ['Career Score', `${profile.careerScore} / 100`],
                ['Streak',       `${profile.streak} days 🔥`],
                ['Skills',       profile.skills.slice(0, 3).join(', ')],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-white/5 last:border-0 gap-2">
                  <span className="text-xs text-slate-500 flex-shrink-0">{k}</span>
                  <span className="text-xs text-slate-200 font-medium text-right">{v}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-500">Complete onboarding to enable profile context</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}