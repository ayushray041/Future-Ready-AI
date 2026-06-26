'use client'

import { Activity, TrendingUp, Brain, Zap } from 'lucide-react'

export function DashboardCards() {
  return (
    <div className="mb-8 grid grid-cols-3 gap-6">
      {/* Career Twin */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-all" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-900/30 text-cyan-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Career Twin</h3>
              </div>
            </div>
            <span className="rounded-full bg-cyan-900/30 px-2 py-1 text-xs font-semibold text-cyan-400">AI ANALYSIS</span>
          </div>

          <p className="text-sm text-slate-400 mb-6">Neural skill network visualization</p>

          {/* Network Visualization */}
          <div className="h-32 flex items-center justify-center mb-6 relative">
            <svg className="h-full w-full" viewBox="0 0 200 120">
              {/* Center node */}
              <circle cx="100" cy="60" r="12" fill="#06b6d4" />
              
              {/* Connected nodes */}
              <line x1="100" y1="60" x2="40" y2="30" stroke="#334155" strokeWidth="1.5" />
              <line x1="100" y1="60" x2="160" y2="30" stroke="#334155" strokeWidth="1.5" />
              <line x1="100" y1="60" x2="30" y2="90" stroke="#334155" strokeWidth="1.5" />
              <line x1="100" y1="60" x2="170" y2="90" stroke="#334155" strokeWidth="1.5" />

              {/* Outer nodes */}
              <circle cx="40" cy="30" r="8" fill="#10b981" opacity="0.8" />
              <circle cx="160" cy="30" r="8" fill="#f59e0b" opacity="0.8" />
              <circle cx="30" cy="90" r="8" fill="#f59e0b" opacity="0.8" />
              <circle cx="170" cy="90" r="8" fill="#06b6d4" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Career Radar */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/30 text-blue-400">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white">Career Radar</h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-4">Multi-dimensional skill analysis</p>

          {/* Radar Chart */}
          <div className="flex items-center justify-center h-32">
            <svg className="h-full w-full" viewBox="0 0 200 200">
              {/* Radar lines */}
              {[0, 72, 144, 216, 288].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const x = 100 + 60 * Math.cos(rad)
                const y = 100 + 60 * Math.sin(rad)
                return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="#334155" strokeWidth="1" />
              })}

              {/* Concentric circles */}
              {[30, 60].map((r, i) => (
                <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.5" />
              ))}

              {/* Data polygon */}
              <polygon
                points="100,40 140,70 130,130 70,130 60,70"
                fill="#0ea5e9"
                opacity="0.2"
                stroke="#0ea5e9"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="mt-4 flex justify-center gap-4 text-xs">
            <span className="text-slate-400">
              <span className="font-bold text-slate-300">Current</span> • <span className="font-bold text-slate-300">Target</span>
            </span>
          </div>
        </div>
      </div>

      {/* Future Simulation */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900/30 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Future Simulation</h3>
              </div>
            </div>
            <span className="rounded-full bg-emerald-900/30 px-2 py-1 text-xs font-semibold text-emerald-400">AI PREDICTED</span>
          </div>

          <p className="text-sm text-slate-400 mb-6">Projected career outcomes</p>

          {/* Current Path */}
          <div className="mb-4 space-y-2">
            <p className="text-xs uppercase font-semibold text-slate-500">Current Path</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Placement Prob.</span>
                <span className="font-bold text-cyan-400">68%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[68%] bg-gradient-to-r from-cyan-500 to-cyan-400" />
              </div>
            </div>
          </div>

          {/* Recommended Path */}
          <div className="space-y-2">
            <p className="text-xs uppercase font-semibold text-slate-500">Recommended Path</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Placement Prob.</span>
                <span className="font-bold text-emerald-400">91%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[91%] bg-gradient-to-r from-emerald-500 to-emerald-400" />
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            ↑ Fix Comm & Resume skills to unlock this path.
          </p>
        </div>
      </div>
    </div>
  )
}
