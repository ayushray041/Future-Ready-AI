'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const readinessTrendData = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 58 },
  { month: 'Apr', value: 65 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 74 },
]

const careerMomentumData = [
  { category: 'Projects', value: 78 },
  { category: 'GitHub', value: 61 },
  { category: 'Interviews', value: 45 },
  { category: 'Learning', value: 83 },
]

const skillGrowthData = [
  { name: 'DSA', value: 85 },
  { name: 'Dev', value: 78 },
  { name: 'AI', value: 72 },
  { name: 'Cloud', value: 68 },
]

export function AnalyticsSection() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Analytics & Growth</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Trend */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-2">Readiness Trend</h3>
          <div className="mb-4">
            <p className="text-3xl font-bold text-white">74%</p>
            <p className="text-sm text-emerald-400 flex items-center gap-1">
              <span>📈</span> +32% this semester
            </p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readinessTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Career Momentum */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Career Momentum</h3>

          <div className="space-y-4">
            {careerMomentumData.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{item.category}</span>
                  <span className={`font-bold ${item.value > 70 ? 'text-cyan-400' : item.value > 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      item.value > 70 ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' :
                      item.value > 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-slate-500 to-slate-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Growth */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Skill Growth</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillGrowthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#6366f1" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">Avg: 70.25%</span>
            <span className="rounded-full bg-indigo-900/30 px-2.5 py-1 text-xs font-semibold text-indigo-400">GROWING</span>
          </div>
        </div>
      </div>
    </section>
  )
}
