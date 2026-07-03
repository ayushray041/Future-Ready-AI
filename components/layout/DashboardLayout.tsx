'use client';

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, MessageSquare, Map, Briefcase,
  FileText, Mic, Users, User, Settings, LogOut, Bell,
  ChevronLeft, ChevronRight, Menu, X, Zap, Search, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

interface SidebarCtx { collapsed: boolean; toggle: () => void }
const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

const NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analytics',     icon: TrendingUp,       label: 'Analytics' },
  { href: '/mentor',        icon: MessageSquare,    label: 'AI Mentor' },
  { href: '/roadmap',       icon: Map,              label: 'Roadmap' },
  { href: '/opportunities', icon: Briefcase,        label: 'Opportunities' },
  { href: '/resume',        icon: FileText,         label: 'Resume' },
  { href: '/interview',     icon: Mic,              label: 'Interview' },
  { href: '/career-twin',   icon: Users,            label: 'Career Twin' },
  { href: '/profile',       icon: User,             label: 'Profile' },
  { href: '/settings',      icon: Settings,         label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const sidebarW = collapsed ? 'w-16' : 'w-60';

  async function handleLogout() {
    await authService.signOut();
    router.push('/login');
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed(p => !p) }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">

        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          border-r border-white/5 bg-slate-900/80 backdrop-blur-xl
          transition-all duration-300
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex-shrink-0
        `}>
          {/* Logo */}
          <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-white text-lg tracking-tight">FutureReady</span>}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-all duration-150 group relative
                    ${active
                      ? 'bg-cyan-500/10 text-cyan-400 shadow-sm ring-1 ring-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-cyan-400' : ''}`} />
                  {!collapsed && <span>{label}</span>}
                  {active && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-800 text-xs text-white
                      opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(p => !p)}
            className="hidden lg:flex items-center justify-center mx-3 mb-3 py-2 rounded-xl
              border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5
              transition-colors text-xs gap-1.5"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>

          {/* User footer */}
          <div className={`border-t border-white/5 p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700
              flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {profile?.displayName?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'US'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{profile?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{profile ? `${profile.year} · ${profile.branch}` : 'Not signed in'}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top navbar */}
          <header className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-6 py-3
            border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search skills, opportunities…"
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2
                  text-sm text-slate-300 placeholder:text-slate-600
                  focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Online badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Online
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setDark(p => !p)}
                className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center
                  text-slate-400 hover:text-white transition-colors"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications */}
              <button className="relative h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center
                text-slate-400 hover:text-white transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400" />
              </button>

              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600
                flex items-center justify-center text-xs font-bold text-white cursor-pointer
                ring-2 ring-cyan-500/30">
                {profile?.displayName?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'US'}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
