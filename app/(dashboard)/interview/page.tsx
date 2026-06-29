'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, ChevronRight, BarChart2, CheckCircle,
  Clock, Zap, RotateCcw, Play, Square, ThumbsUp,
  AlertCircle, ArrowLeft, ArrowRight, Target, Brain,
  Code, Users, Briefcase, Award,
} from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
type CategoryId = 'dsa' | 'system' | 'behavioral' | 'ml' | 'frontend' | 'hr';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type SessionView = 'dashboard' | 'category' | 'session' | 'result';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  count: number;
  avgScore: number | null;
  description: string;
}

interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  hint: string;
  sampleAnswer: string;
  tags: string[];
}

interface FeedbackResult {
  score: number;
  clarity: number;
  depth: number;
  relevance: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

const CATEGORIES: Category[] = [
  { id: 'dsa',      label: 'Data Structures & Algo', icon: Code,     color: 'text-cyan-400',    glow: 'bg-cyan-500',    count: 45, avgScore: 82,   description: 'Arrays, trees, graphs, dynamic programming and more.' },
  { id: 'system',   label: 'System Design',           icon: Brain,    color: 'text-indigo-400',  glow: 'bg-indigo-500',  count: 20, avgScore: 64,   description: 'Scalable architecture, databases, caching, load balancing.' },
  { id: 'behavioral',label: 'Behavioral (STAR)',      icon: Users,    color: 'text-emerald-400', glow: 'bg-emerald-500', count: 30, avgScore: 88,   description: 'Leadership, teamwork, conflict resolution and growth stories.' },
  { id: 'ml',       label: 'ML & AI',                 icon: Zap,      color: 'text-amber-400',   glow: 'bg-amber-500',   count: 25, avgScore: null, description: 'Machine learning concepts, model evaluation, deep learning.' },
  { id: 'frontend', label: 'Frontend Dev',            icon: Target,   color: 'text-rose-400',    glow: 'bg-rose-500',    count: 22, avgScore: 74,   description: 'React, JavaScript internals, performance, accessibility.' },
  { id: 'hr',       label: 'HR & Culture Fit',        icon: Briefcase,color: 'text-blue-400',    glow: 'bg-blue-500',    count: 15, avgScore: null, description: 'Salary negotiation, career goals, culture alignment.' },
];

const QUESTIONS: Record<CategoryId, Question[]> = {
  dsa: [
    { id:'d1', difficulty:'Medium', text:'Given an array of integers, find the longest subarray with a sum equal to 0. Explain your approach and its time complexity.', hint:'Consider using a prefix sum and a hash map.', tags:['Arrays','Hash Map','Prefix Sum'], sampleAnswer:'Use a hashmap to store prefix sums. For each index, check if (current_prefix - 0) exists in the map. Time: O(n), Space: O(n).', },
    { id:'d2', difficulty:'Hard',   text:'Design a LRU (Least Recently Used) cache that supports get and put operations in O(1) time.', hint:'Combine a doubly linked list with a hash map.', tags:['Design','Linked List','Hash Map'], sampleAnswer:'Use a HashMap for O(1) lookup and a doubly linked list for O(1) insertion/deletion. The most recently used item is always at the head.', },
    { id:'d3', difficulty:'Easy',   text:'Reverse a linked list iteratively and recursively. Which is more space-efficient?', hint:'Track prev, curr, and next pointers iteratively.', tags:['Linked List','Recursion'], sampleAnswer:'Iterative uses O(1) space; recursive uses O(n) stack space. Iterative is preferred in production.', },
  ],
  system: [
    { id:'s1', difficulty:'Hard',   text:'Design a URL shortener like bit.ly that handles 100 million URLs and 10 billion reads per day. Walk through your architecture choices.', hint:'Think about: hashing strategy, database sharding, CDN, and caching.', tags:['Scale','Database','Caching','CDN'], sampleAnswer:'Base62 encoding for short codes, write to primary DB + read from replicas, Redis cache for hot URLs, CDN at edge, horizontal sharding by short code hash.', },
    { id:'s2', difficulty:'Medium', text:'How would you design a notification system that delivers push, email, and SMS notifications at scale?', hint:'Consider message queues, fan-out patterns, and idempotency.', tags:['Messaging','Queue','Fan-out'], sampleAnswer:'Kafka for message ingestion, worker pools per channel (email/SMS/push), retry with exponential backoff, deduplication via message IDs.', },
  ],
  behavioral: [
    { id:'b1', difficulty:'Medium', text:'Tell me about a time you had a conflict with a team member. How did you resolve it?', hint:'Use STAR: Situation, Task, Action, Result.', tags:['Conflict','Teamwork','Communication'], sampleAnswer:'Describe a specific disagreement, your empathetic approach to understand their perspective, the compromise reached, and the positive outcome for the project.', },
    { id:'b2', difficulty:'Easy',   text:'Describe a project you are most proud of and explain your specific contribution.', hint:'Quantify impact wherever possible.', tags:['Achievement','Leadership'], sampleAnswer:'Focus on your ownership, technical decisions made, team coordination, and measurable results (users, performance gains, revenue impact).', },
  ],
  ml: [
    { id:'m1', difficulty:'Medium', text:'Explain the bias-variance tradeoff. How do you detect and address overfitting in a deep neural network?', hint:'Think about regularization techniques, early stopping, and data augmentation.', tags:['Deep Learning','Regularization'], sampleAnswer:'Overfitting: high train accuracy, low val accuracy. Fix with dropout, L2 regularization, early stopping, data augmentation, reducing model capacity.', },
    { id:'m2', difficulty:'Hard',   text:'You have a dataset with 95% negative labels and 5% positive. How do you train and evaluate a classifier?', hint:'Consider class imbalance techniques and the right metrics.', tags:['Class Imbalance','Metrics'], sampleAnswer:'Oversample minority (SMOTE), undersample majority, use class weights, evaluate with F1, AUC-ROC, Precision-Recall curve — not accuracy.', },
  ],
  frontend: [
    { id:'f1', difficulty:'Medium', text:'Explain React\'s reconciliation algorithm. How does the virtual DOM diffing work and what are its limitations?', hint:'Think about keys, component types, and the tree-comparison algorithm.', tags:['React','Virtual DOM','Performance'], sampleAnswer:'React compares trees level-by-level using heuristics. Keys help identify moved items. O(n) complexity. Limitation: assumes same component type at same position.', },
    { id:'f2', difficulty:'Hard',   text:'How would you optimize a React application that renders a list of 10,000 items?', hint:'Consider virtualization, memoization, and code splitting.', tags:['Performance','Virtualization'], sampleAnswer:'react-window for virtualization, React.memo for components, useMemo/useCallback for stable references, pagination or infinite scroll, lazy loading.', },
  ],
  hr: [
    { id:'h1', difficulty:'Easy', text:'Why do you want to work at this company specifically? What excites you about this role?', hint:'Research the company\'s mission, recent products, and engineering culture.', tags:['Culture Fit','Motivation'], sampleAnswer:'Connect company values to your personal goals. Reference specific products, engineering blog posts, or company initiatives that genuinely excite you.', },
    { id:'h2', difficulty:'Medium', text:'Where do you see yourself in 5 years? How does this role fit into that vision?', hint:'Be ambitious but realistic. Show self-awareness and growth mindset.', tags:['Career Goals','Vision'], sampleAnswer:'Frame a growth arc (IC → Tech Lead → Architect or PM). Tie it to the company\'s scale — "as the company grows, I want to grow with the problems it\'s solving."', },
  ],
};

const RADAR_DATA = [
  { skill: 'DSA',        score: 82 },
  { skill: 'System',     score: 64 },
  { skill: 'Behavioral', score: 88 },
  { skill: 'Frontend',   score: 74 },
  { skill: 'ML/AI',      score: 0  },
  { skill: 'HR',         score: 0  },
];

const PAST_SESSIONS = [
  { date: '2 days ago', category: 'DSA',      questions: 3, score: 82, time: '18 min' },
  { date: '1 week ago', category: 'Behavioral',questions: 2, score: 88, time: '12 min' },
  { date: '2 weeks ago',category: 'System Design',questions:1, score: 64,'time': '25 min'},
  { date: '3 weeks ago',category: 'Frontend', questions: 2, score: 74, time: '15 min' },
];

const DIFF_COLOR: Record<Difficulty, string> = {
  Easy:   'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard:   'text-rose-400 bg-rose-500/10',
};

/* ─────────────────────────────────────────────────────────────
   TIMER HOOK
───────────────────────────────────────────────────────────── */
function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setElapsed(s => s + 1), 1000);
    else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  function reset() { setElapsed(0); }
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return { display: `${m}:${s}`, reset, elapsed };
}

/* ─────────────────────────────────────────────────────────────
   MOCK FEEDBACK GENERATOR
───────────────────────────────────────────────────────────── */
function generateFeedback(answer: string, question: Question): FeedbackResult {
  const len = answer.trim().split(/\s+/).length;
  const base = Math.min(95, Math.max(45, 55 + len * 0.4));
  return {
    score:       Math.round(base),
    clarity:     Math.round(base - 5 + Math.random() * 10),
    depth:       Math.round(base - 8 + Math.random() * 10),
    relevance:   Math.round(base + 2 + Math.random() * 8),
    strengths: [
      len > 30 ? 'Good depth — you elaborated on the approach' : 'Concise answer',
      'Addressed the core question',
    ],
    improvements: [
      len < 50 ? 'Add more detail — mention time and space complexity' : 'Good length',
      'Consider discussing edge cases (empty input, single element)',
    ],
    modelAnswer: question.sampleAnswer,
  };
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const [view, setView] = useState<SessionView>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [sessionResults, setSessionResults] = useState<FeedbackResult[]>([]);
  const { display: timerDisplay, reset: resetTimer, elapsed } = useTimer(view === 'session' && !submitted);

  const questions = selectedCategory ? QUESTIONS[selectedCategory.id] : [];
  const currentQ = questions[qIndex];

  function startSession(cat: Category) {
    setSelectedCategory(cat);
    setQIndex(0);
    setAnswer('');
    setSubmitted(false);
    setFeedback(null);
    setSessionResults([]);
    resetTimer();
    setView('session');
  }

  async function submitAnswer() {
    if (!answer.trim() || !currentQ) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    const fb = generateFeedback(answer, currentQ);
    setFeedback(fb);
    setSessionResults(p => [...p, fb]);
    setSubmitted(true);
    setLoading(false);
  }

  function nextQuestion() {
    if (qIndex < questions.length - 1) {
      setQIndex(p => p + 1);
      setAnswer('');
      setSubmitted(false);
      setFeedback(null);
    } else {
      setView('result');
    }
  }

  function endSession() {
    setView('dashboard');
    setSelectedCategory(null);
    setSessionResults([]);
  }

  const avgSession = sessionResults.length
    ? Math.round(sessionResults.reduce((s, r) => s + r.score, 0) / sessionResults.length)
    : 0;

  /* ── DASHBOARD VIEW ── */
  if (view === 'dashboard') return (
    <div className="space-y-6">
      <PageHeader
        title="Mock Interview"
        description="AI-powered practice sessions with real-time feedback and performance tracking."
        badge="AI Powered"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sessions Done"   value="4"    icon={Award}    color="cyan"    />
        <StatCard title="Avg Score"       value="77%"  icon={Target}   color="emerald" trend={{ value: '+12% this month', up: true }} />
        <StatCard title="Questions"       value="8"    icon={Brain}    color="blue"    />
        <StatCard title="Best Category"   value="Behavioral" icon={Users} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category grid */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 px-1">Choose a Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => startSession(cat)}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/60
                    backdrop-blur-xl hover:border-white/10 hover:bg-white/5 transition-all text-left group">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${cat.color.replace('text-', 'bg-').replace('400', '500/10')}`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{cat.label}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{cat.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">{cat.count} questions</span>
                      {cat.avgScore !== null ? (
                        <span className={`text-xs font-semibold ${cat.avgScore >= 80 ? 'text-emerald-400' : cat.avgScore >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                          Avg: {cat.avgScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">Not attempted</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Radar */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={RADAR_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Past sessions */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {PAST_SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{s.category}</p>
                    <p className="text-xs text-slate-500">{s.date} · {s.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${s.score >= 80 ? 'text-emerald-400' : s.score >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {s.score}%
                    </p>
                    <p className="text-xs text-slate-600">{s.questions} Qs</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  /* ── SESSION VIEW ── */
  if (view === 'session' && currentQ) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <button onClick={endSession}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> End session
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{selectedCategory?.label}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs font-semibold text-white">{qIndex + 1} / {questions.length}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-xs font-mono text-slate-300">
            <Clock className="h-3 w-3 text-slate-500" /> {timerDisplay}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((qIndex + (submitted ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      {/* Question card */}
      <GlassCard padding="lg">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${DIFF_COLOR[currentQ.difficulty]}`}>
            {currentQ.difficulty}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentQ.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">{t}</span>
            ))}
          </div>
        </div>

        <h2 className="text-base font-semibold text-white leading-relaxed mb-2">{currentQ.text}</h2>

        <details className="mt-3 mb-5 group">
          <summary className="text-xs text-cyan-400 cursor-pointer list-none flex items-center gap-1.5 select-none">
            <Zap className="h-3 w-3" />
            <span className="group-open:hidden">Show hint</span>
            <span className="hidden group-open:inline">Hide hint</span>
          </summary>
          <p className="mt-2 text-sm text-slate-400 pl-5 leading-relaxed border-l border-cyan-500/20">
            {currentQ.hint}
          </p>
        </details>

        {!submitted ? (
          <>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here… Aim for 3–5 sentences covering approach, complexity, and trade-offs."
              rows={7}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40
                resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecording(p => !p)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                    ${recording ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30' : 'bg-white/5 text-slate-400 hover:text-slate-200'}`}>
                  {recording ? <><MicOff className="h-3.5 w-3.5" /> Stop recording</> : <><Mic className="h-3.5 w-3.5" /> Voice answer</>}
                </button>
                <span className="text-xs text-slate-600">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                  text-sm font-semibold text-white disabled:opacity-40 transition-all
                  hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/10">
                {loading
                  ? <><span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating…</>
                  : <><CheckCircle className="h-3.5 w-3.5" /> Submit Answer</>
                }
              </button>
            </div>
          </>
        ) : feedback ? (
          /* Feedback panel */
          <div className="space-y-4">
            {/* Score ring */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5">
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={feedback.score >= 80 ? '#10b981' : feedback.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(feedback.score / 100) * 201} 201`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{feedback.score}</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[['Clarity', feedback.clarity], ['Depth', feedback.depth], ['Relevance', feedback.relevance]].map(([label, val]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-300 font-medium">{val}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Improve
              </p>
              <ul className="space-y-1">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="mt-0.5 text-amber-400 flex-shrink-0">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Model answer */}
            <details className="group">
              <summary className="text-xs text-cyan-400 cursor-pointer list-none flex items-center gap-1.5 select-none">
                <Zap className="h-3 w-3" />
                <span className="group-open:hidden">Show model answer</span>
                <span className="hidden group-open:inline">Hide model answer</span>
              </summary>
              <div className="mt-2 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-sm text-slate-300 leading-relaxed">{feedback.modelAnswer}</p>
              </div>
            </details>

            {/* Nav */}
            <div className="flex justify-between pt-2">
              <button onClick={() => { setSubmitted(false); setAnswer(''); setFeedback(null); }}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </button>
              <button onClick={nextQuestion}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                  text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500 transition-all">
                {qIndex < questions.length - 1 ? <><ArrowRight className="h-4 w-4" /> Next Question</> : <><Award className="h-4 w-4" /> View Results</>}
              </button>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );

  /* ── RESULT VIEW ── */
  if (view === 'result') return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20
          flex items-center justify-center mx-auto mb-4 ring-1 ring-cyan-500/30">
          <Award className="h-8 w-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Session Complete!</h2>
        <p className="text-slate-400 text-sm">{selectedCategory?.label} · {questions.length} questions</p>
      </div>

      {/* Score summary */}
      <GlassCard padding="lg">
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-3xl font-bold text-white">{avgSession}%</p>
            <p className="text-xs text-slate-500 mt-1">Average Score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{sessionResults.length}</p>
            <p className="text-xs text-slate-500 mt-1">Questions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {Math.round(elapsed / 60)}m
            </p>
            <p className="text-xs text-slate-500 mt-1">Time Spent</p>
          </div>
        </div>

        {/* Per-Q scores */}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sessionResults.map((r, i) => ({ name: `Q${i + 1}`, score: r.score }))}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }} />
            <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="flex gap-3">
        <button onClick={endSession}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-400
            hover:text-white hover:bg-white/5 transition-all">
          Back to Dashboard
        </button>
        <button onClick={() => startSession(selectedCategory!)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
            bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white
            hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/10">
          <Play className="h-4 w-4" /> Retry Session
        </button>
      </div>
    </div>
  );

  return null;
}
