'use client'

import { ExternalLink, ChevronRight } from 'lucide-react'

interface OpportunityCardProps {
  initial: string
  type: string
  match: string
  title: string
  deadline: string
  color: string
  barColor: string
}

function OpportunityCard({ initial, type, match, title, deadline, color, barColor }: OpportunityCardProps) {
  const matchPercent = parseInt(match)
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-6 backdrop-blur-xl hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900">
      {/* Background Glow */}
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all ${color}`} />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${color}`}>
            {initial}
          </div>
          <div className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase text-white ${color} bg-opacity-20 border border-current border-opacity-30`}>
            {type}
          </div>
        </div>

        {/* Match Score */}
        <div>
          <p className={`text-sm font-bold ${color}`}>{match} match</p>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white">{title}</h3>

        {/* Deadline */}
        <p className="text-sm text-slate-500">• Deadline: {deadline}</p>

        {/* Progress Bar */}
        <div className={`h-1.5 rounded-full bg-slate-800 overflow-hidden`}>
          <div className={`h-full w-[${matchPercent}%] rounded-full ${barColor} transition-all`} />
        </div>

        {/* Apply Button */}
        <button className={`w-full rounded-lg py-2.5 font-semibold text-white transition-all border border-current border-opacity-30 hover:bg-opacity-20 ${color} bg-opacity-10 flex items-center justify-center gap-2 group/btn`}>
          Apply Now <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export function OpportunityEngine() {
  const opportunities = [
    {
      initial: 'G',
      type: 'OPEN SOURCE',
      match: '94%',
      title: 'Google Summer of Code',
      deadline: 'Apr 2 · 2025',
      color: 'bg-green-600',
      barColor: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    },
    {
      initial: 'M',
      type: 'COMPETITION',
      match: '88%',
      title: 'Microsoft Imagine Cup',
      deadline: 'Mar 15 · 2025',
      color: 'bg-blue-600',
      barColor: 'bg-gradient-to-r from-blue-500 to-blue-400',
    },
    {
      initial: 'M',
      type: 'INTERNSHIP',
      match: '72%',
      title: 'Meta AI Research Intern',
      deadline: 'Rolling',
      color: 'bg-emerald-600',
      barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    },
    {
      initial: 'H',
      type: 'FELLOWSHIP',
      match: '81%',
      title: 'MLH Fellowship',
      deadline: 'Feb 28 · 2025',
      color: 'bg-amber-600',
      barColor: 'bg-gradient-to-r from-amber-500 to-amber-400',
    },
    {
      initial: 'D',
      type: 'HACKATHON',
      match: '96%',
      title: 'Devfolio Hackathon',
      deadline: 'Jan 20 · 2025',
      color: 'bg-rose-600',
      barColor: 'bg-gradient-to-r from-rose-500 to-rose-400',
    },
    {
      initial: 'A',
      type: 'FELLOWSHIP',
      match: '83%',
      title: 'AWS Builders Program',
      deadline: 'Mar 1 · 2025',
      color: 'bg-amber-600',
      barColor: 'bg-gradient-to-r from-amber-500 to-amber-400',
    },
  ]

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-2">
            <span className="text-cyan-400">💼</span> Opportunity Engine
          </h2>
          <span className="inline-block rounded-full bg-cyan-900/30 px-3 py-1 text-xs font-semibold text-cyan-400">PERSONALIZED</span>
        </div>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp, idx) => (
          <OpportunityCard key={idx} {...opp} />
        ))}
      </div>
    </section>
  )
}
