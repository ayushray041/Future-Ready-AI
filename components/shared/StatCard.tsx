'use client';

import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo';
  trend?: { value: string; up: boolean };
}

const colorMap = {
  cyan:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    ring: 'ring-cyan-500/20'    },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   ring: 'ring-amber-500/20'   },
  rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-400',    ring: 'ring-rose-500/20'    },
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    ring: 'ring-blue-500/20'    },
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  ring: 'ring-indigo-500/20'  },
};

export default function StatCard({ title, value, sub, icon: Icon, color = 'cyan', trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/70
      bg-card/80 backdrop-blur-xl p-5 ring-1 ${c.ring}
      hover:shadow-lg transition-shadow group`}>
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: 'currentColor' }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          {trend && (
            <span className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold
              ${trend.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
