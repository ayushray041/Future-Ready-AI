'use client'

import { Zap, TrendingUp } from 'lucide-react'

export function WelcomeHero() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/50 to-slate-900/20 p-8 backdrop-blur-xl">
      {/* Background Elements */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-900/30 px-3 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-cyan-500/50">
            <Zap className="h-3 w-3" />
            AI-POWERED CAREER OS
          </div>

          <h1 className="mb-3 text-4xl font-bold text-white">
            Welcome back, <span className="text-cyan-400">Ayush</span> 👋
          </h1>

          <p className="text-lg text-slate-400">
            Your AI-powered companion to analyze, plan, and accelerate your career journey to your dream future.
          </p>

          {/* Stats Row */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Target Career</p>
              <p className="text-xl font-bold text-white">AI Engineer</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Current Year</p>
              <p className="text-xl font-bold text-white">2nd Year</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Streak</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">14 days</span>
                <span className="text-orange-400">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Career Readiness Gauge */}
        <div className="flex flex-col items-center">
          <p className="mb-4 text-xs uppercase text-slate-500 font-semibold">Career Readiness</p>
          <div className="relative h-40 w-40">
            <svg className="h-full w-full" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle cx="80" cy="80" r="70" fill="none" stroke="#334155" strokeWidth="8" />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gradientCircle)"
                strokeWidth="8"
                strokeDasharray="311"
                strokeDashoffset="78"
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <defs>
                <linearGradient id="gradientCircle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">74</p>
                <p className="text-xs text-slate-400">Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button className="flex-1 max-w-xs rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Explore Dashboard
        </button>
        <button className="rounded-xl border border-cyan-500/50 bg-cyan-900/20 px-6 py-3 font-semibold text-cyan-400 hover:bg-cyan-900/40 transition-all">
          Ask AI Mentor
        </button>
      </div>
    </div>
  )
}
