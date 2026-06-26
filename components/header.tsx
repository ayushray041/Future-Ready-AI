'use client'

import { Search, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search skills, opportunities, resources..."
              className="w-full rounded-xl bg-slate-800/50 border border-slate-700 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-6 md:ml-8">
          {/* System Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/30 border border-slate-700 hidden md:flex">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-400 uppercase">System Online</span>
          </div>

          {/* Notifications */}
          <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyan-500 flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </div>
          </button>

          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all">
            AY
          </div>
        </div>
      </div>
    </header>
  )
}
