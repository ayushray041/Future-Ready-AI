'use client'

import { CheckCircle, Play, Lock, ChevronRight } from 'lucide-react'

const roadmapStages = [
  {
    year: '1st Year',
    title: 'Foundations',
    status: 'completed',
    items: ['Python Basics', 'Web Dev Intro', 'DSA Fundamentals'],
  },
  {
    year: '2nd Year',
    title: 'Building Up',
    status: 'current',
    items: ['React + Node.js', 'DSA Advanced', 'First Project'],
  },
  {
    year: '3rd Year',
    title: 'Specialise',
    status: 'upcoming',
    items: ['AI/ML Mastery', 'Cloud Certs', 'Internship'],
  },
  {
    year: '4th Year',
    title: 'Ship It',
    status: 'upcoming',
    items: ['Capstone Project', 'Portfolio Polish', 'Interview Prep'],
  },
  {
    year: 'Internship',
    title: 'Real World',
    status: 'upcoming',
    items: ['Industry Exposure', 'Networking', 'PPO Target'],
  },
  {
    year: 'Placement',
    title: 'Dream Job',
    status: 'upcoming',
    items: ['Top Company', '10LPA+ Target', 'AI Engineer Role'],
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-8 w-8 text-emerald-400" />
    case 'current':
      return <Play className="h-8 w-8 text-cyan-400" />
    default:
      return <Lock className="h-8 w-8 text-slate-600" />
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-900/20 border-emerald-500/30'
    case 'current':
      return 'bg-cyan-900/20 border-cyan-500/30'
    default:
      return 'bg-slate-800/20 border-slate-700/30'
  }
}

export function CareerRoadmap() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-2">
            <span className="text-cyan-400">🎯</span> Career Roadmap
          </h2>
          <p className="text-sm text-slate-400">Semester-by-semester journey to your dream role</p>
        </div>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
          View Full Plan <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-900/20 p-8 backdrop-blur-xl overflow-x-auto">
        {/* Connection Line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-slate-700/50" />

        {/* Stages */}
        <div className="flex gap-4 min-w-min pb-4">
          {roadmapStages.map((stage, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-max">
              {/* Icon Circle */}
              <div className="relative mb-4 z-10 flex justify-center">
                <div className={`rounded-full border-4 border-slate-900 p-2 ${getStatusBg(stage.status)}`}>
                  {getStatusIcon(stage.status)}
                </div>
              </div>

              {/* Card */}
              <div className={`rounded-xl border ${getStatusBg(stage.status)} backdrop-blur-sm px-4 py-3 text-center w-40`}>
                <p className="text-xs uppercase text-slate-400 font-semibold mb-1">{stage.year}</p>
                <h3 className="text-sm font-bold text-white mb-3">{stage.title}</h3>
                <ul className="space-y-1 text-xs">
                  {stage.items.map((item, i) => (
                    <li key={i} className="text-slate-400 flex items-center gap-2">
                      <span className="text-emerald-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
