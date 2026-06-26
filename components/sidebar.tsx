'use client'

import { LayoutGrid, Zap, Users, Star, Map, Briefcase, FileText, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '#', active: true },
  { icon: Zap, label: 'AI Mentor', href: '#' },
  { icon: Users, label: 'Career Twin', href: '#' },
  { icon: Star, label: 'Skill Galaxy', href: '#' },
  { icon: Map, label: 'Roadmap', href: '#' },
  { icon: Briefcase, label: 'Opportunities', href: '#' },
  { icon: FileText, label: 'Resume Analyzer', href: '#' },
  { icon: User, label: 'Profile', href: '#' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
            <span className="text-xs font-bold text-white">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FutureReady</h1>
            <p className="text-xs text-slate-400">AI Career OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="px-3 text-xs font-semibold uppercase text-slate-500">Navigation</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                item.active
                  ? 'bg-cyan-900/30 text-cyan-400 ring-1 ring-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.active && <div className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-sm font-bold text-white">
            AY
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Ayush Sharma</p>
            <p className="text-xs text-slate-400 truncate">2nd Year · AI Engineer</p>
          </div>
        </div>
        <div className="flex gap-2 px-2">
          <button className="flex-1 rounded-lg bg-slate-800/50 p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Settings className="h-4 w-4 mx-auto" />
          </button>
          <button className="flex-1 rounded-lg bg-slate-800/50 p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <LogOut className="h-4 w-4 mx-auto" />
          </button>
        </div>
      </div>
    </aside>
  )
}
