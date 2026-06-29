'use client';

import { useState, useMemo } from 'react';
import { Search, ExternalLink, Zap, Briefcase, Code, Trophy, GraduationCap, Filter } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

type OppType = 'ALL' | 'INTERNSHIP' | 'HACKATHON' | 'FELLOWSHIP' | 'COMPETITION' | 'OPEN SOURCE';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: OppType;
  match: number;
  deadline: string;
  stipend?: string;
  location?: string;
  tags: string[];
  color: string;
  initial: string;
  rolling?: boolean;
}

const OPPS: Opportunity[] = [
  { id:'1', title:'Google Summer of Code 2025',     company:'Google',    type:'OPEN SOURCE',  match:94, deadline:'Apr 2, 2025',  tags:['Python','ML','Open Source'], color:'#4285F4', initial:'G' },
  { id:'2', title:'Microsoft Imagine Cup',          company:'Microsoft', type:'COMPETITION',  match:88, deadline:'Mar 15, 2025', tags:['AI','Innovation'],             color:'#00A4EF', initial:'M' },
  { id:'3', title:'Meta AI Research Intern',        company:'Meta',      type:'INTERNSHIP',   match:72, deadline:'Rolling',      stipend:'$8000/mo', tags:['AI','Research','PyTorch'],  color:'#0082FB', initial:'M', rolling:true },
  { id:'4', title:'MLH Fellowship',                 company:'MLH',       type:'FELLOWSHIP',   match:81, deadline:'Feb 28, 2025', stipend:'$5000',    tags:['Open Source','Networking'], color:'#E01F56', initial:'M' },
  { id:'5', title:'Devfolio Hackathon',             company:'Devfolio',  type:'HACKATHON',    match:96, deadline:'Jan 20, 2025', tags:['Hackathon','Web3'],            color:'#6366f1', initial:'D' },
  { id:'6', title:'AWS Builders Program',           company:'Amazon',    type:'FELLOWSHIP',   match:83, deadline:'Mar 1, 2025',  stipend:'Credits',  tags:['Cloud','AWS'],              color:'#FF9900', initial:'A' },
  { id:'7', title:'Goldman Sachs Engineering Intern',company:'Goldman',  type:'INTERNSHIP',   match:67, deadline:'Rolling',      stipend:'₹80k/mo',  tags:['Finance','Python'],         color:'#6699CC', initial:'G', rolling:true },
  { id:'8', title:'Smart India Hackathon',          company:'Govt.',     type:'HACKATHON',    match:79, deadline:'Oct 30, 2025', tags:['Govtech','Innovation'],         color:'#10b981', initial:'S' },
  { id:'9', title:'Jane Street Trading Challenge',  company:'Jane St',   type:'COMPETITION',  match:60, deadline:'Nov 15, 2025', tags:['Finance','Math','Algorithms'], color:'#f59e0b', initial:'J' },
  { id:'10',title:'LinkedIn Campus Placement',      company:'LinkedIn',  type:'INTERNSHIP',   match:85, deadline:'Rolling',      stipend:'₹1L/mo',   tags:['Product','SWE','AI'],       color:'#0A66C2', initial:'L', rolling:true },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  INTERNSHIP:   Briefcase,
  HACKATHON:    Code,
  COMPETITION:  Trophy,
  FELLOWSHIP:   GraduationCap,
  'OPEN SOURCE': Zap,
};

const TYPES: OppType[] = ['ALL', 'INTERNSHIP', 'HACKATHON', 'FELLOWSHIP', 'COMPETITION', 'OPEN SOURCE'];

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<OppType>('ALL');
  const [minMatch, setMinMatch] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'deadline'>('match');

  const filtered = useMemo(() => {
    return OPPS
      .filter(o => activeType === 'ALL' || o.type === activeType)
      .filter(o => o.match >= minMatch)
      .filter(o => !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase()) || o.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
      .sort((a, b) => sortBy === 'match' ? b.match - a.match : a.deadline.localeCompare(b.deadline));
  }, [search, activeType, minMatch, sortBy]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunity Engine"
        description="Personalized internships, hackathons, and fellowships matched to your profile."
        badge="Personalized"
      />

      {/* Filters */}
      <GlassCard padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, company, or skill…"
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'match'|'deadline')}
              className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300
                focus:outline-none focus:ring-1 focus:ring-cyan-500/40">
              <option value="match" className="bg-slate-900">Sort: Best Match</option>
              <option value="deadline" className="bg-slate-900">Sort: Deadline</option>
            </select>
          </div>

          {/* Min match */}
          <select value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}
            className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300
              focus:outline-none focus:ring-1 focus:ring-cyan-500/40">
            <option value={0} className="bg-slate-900">All match %</option>
            <option value={70} className="bg-slate-900">70%+ match</option>
            <option value={80} className="bg-slate-900">80%+ match</option>
            <option value={90} className="bg-slate-900">90%+ match</option>
          </select>
        </div>

        {/* Type pills */}
        <div className="flex gap-2 flex-wrap mt-3">
          {TYPES.map(t => {
            const Icon = TYPE_ICONS[t] || Zap;
            return (
              <button key={t} onClick={() => setActiveType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${activeType === t
                    ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                {t !== 'ALL' && <Icon className="h-3 w-3" />}
                {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500 self-center">{filtered.length} results</span>
        </div>
      </GlassCard>

      {/* Grid */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Search className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No opportunities match your filters</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting the search or match threshold</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(opp => {
            const Icon = TYPE_ICONS[opp.type] || Zap;
            const matchColor = opp.match >= 85 ? 'text-emerald-400 bg-emerald-500/10' : opp.match >= 70 ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-white/5';

            return (
              <GlassCard key={opp.id} className="hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: opp.color + '22', color: opp.color }}>
                    {opp.initial}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${matchColor}`}>
                    {opp.match}% match
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-500 font-medium">{opp.company}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-700" />
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Icon className="h-3 w-3" />
                    {opp.type.charAt(0) + opp.type.slice(1).toLowerCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{opp.title}</h3>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {opp.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className={opp.rolling ? 'text-emerald-400' : ''}>
                    📅 {opp.deadline}
                  </span>
                  {opp.stipend && <span className="text-slate-400">💰 {opp.stipend}</span>}
                </div>

                {/* Match bar */}
                <div className="h-1 rounded-full bg-white/5 mb-4 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                    style={{ width: `${opp.match}%` }} />
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                  text-xs font-semibold text-white transition-all
                  bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10">
                  Apply Now <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
