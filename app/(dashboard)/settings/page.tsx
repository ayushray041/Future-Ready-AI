'use client';

import { useState } from 'react';
import {
  User, Bell, Lock, Palette, AlertTriangle,
  Save, CheckCircle, Loader2, ChevronRight, Eye, EyeOff,
  Sun, Moon, Monitor, Trash2, LogOut,
} from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

/* ─────────────────────────────────────────────────────────────
   TOGGLE COMPONENT
───────────────────────────────────────────────────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 focus:outline-none
        ${value ? 'bg-cyan-500' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
        ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────────────────────── */
function Section({ icon: Icon, color, title, children }: {
  icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
        <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </GlassCard>
  );
}

function SettingRow({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
type ThemeOption = 'dark' | 'light' | 'system';

export default function SettingsPage() {
  /* Account */
  const [name, setName]         = useState('Ayush Sharma');
  const [email, setEmail]       = useState('ayush.sharma@nit.ac.in');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savedAccount, setSavedAccount]   = useState(false);

  /* Password */
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [savingPw, setSavingPw]     = useState(false);
  const [savedPw, setSavedPw]       = useState(false);
  const [pwError, setPwError]       = useState('');

  /* Notifications */
  const [notifs, setNotifs] = useState({
    opportunityAlerts:  true,
    interviewReminders: true,
    weeklyDigest:       true,
    mentorMessages:     true,
    achievementBadges:  true,
    productUpdates:     false,
    marketingEmails:    false,
  });

  /* Privacy */
  const [privacy, setPrivacy] = useState({
    publicProfile:     true,
    showCareerScore:   true,
    showSkills:        true,
    allowDataAnalysis: true,
    showInLeaderboard: false,
  });

  /* Theme */
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* Danger */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]             = useState('');

  async function saveAccount() {
    setSavingAccount(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingAccount(false);
    setSavedAccount(true);
    setTimeout(() => setSavedAccount(false), 2500);
  }

  async function changePassword() {
    if (!currentPw) { setPwError('Enter your current password'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwError('');
    setSavingPw(true);
    await new Promise(r => setTimeout(r, 900));
    setSavingPw(false);
    setSavedPw(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setSavedPw(false), 2500);
  }

  const THEME_OPTIONS: { id: ThemeOption; icon: React.ElementType; label: string }[] = [
    { id: 'dark',   icon: Moon,    label: 'Dark'   },
    { id: 'light',  icon: Sun,     label: 'Light'  },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  const ACCENT_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account, notifications, and preferences."
        badge="Account"
      />

      {/* ── ACCOUNT ── */}
      <Section icon={User} color="bg-cyan-500/10 text-cyan-400" title="Account Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Full name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white
                focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white
                focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-colors" />
          </div>
        </div>

        <button onClick={saveAccount} disabled={savingAccount}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
            text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 transition-all
            shadow-lg shadow-cyan-500/10">
          {savingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : savedAccount ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {savedAccount ? 'Saved!' : 'Save Changes'}
        </button>

        {/* Password change */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" /> Change Password
          </p>
          {pwError && (
            <p className="text-xs text-rose-400 mb-2 px-3 py-2 rounded-lg bg-rose-500/10">{pwError}</p>
          )}
          {savedPw && (
            <p className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> Password updated successfully
            </p>
          )}
          <div className="space-y-3">
            {[
              { label: 'Current password', value: currentPw, set: setCurrentPw },
              { label: 'New password',     value: newPw,     set: setNewPw     },
              { label: 'Confirm new',      value: confirmPw, set: setConfirmPw },
            ].map(({ label, value, set }) => (
              <div key={label} className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder={label}
                  value={value}
                  onChange={e => set(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 pr-10 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPw ? 'Hide' : 'Show'} passwords
              </button>
              <button onClick={changePassword} disabled={savingPw}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5
                  text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-60 transition-all">
                {savingPw ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Update Password
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── NOTIFICATIONS ── */}
      <Section icon={Bell} color="bg-amber-500/10 text-amber-400" title="Notifications">
        <p className="text-xs text-slate-500 -mt-2 mb-4">Control what updates you receive via email and in-app.</p>
        {(Object.keys(notifs) as (keyof typeof notifs)[]).map(key => {
          const labels: Record<keyof typeof notifs, [string, string]> = {
            opportunityAlerts:  ['Opportunity Alerts',    'New opportunities matching your profile'],
            interviewReminders: ['Interview Reminders',   'Remind me to practice daily'],
            weeklyDigest:       ['Weekly Career Digest',  'Summary of your progress every Monday'],
            mentorMessages:     ['Mentor Messages',       'Replies and suggestions from AI Mentor'],
            achievementBadges:  ['Achievement Badges',    'Celebrate milestones and streaks'],
            productUpdates:     ['Product Updates',       'New FutureReady features and improvements'],
            marketingEmails:    ['Marketing Emails',      'Tips, offers, and career resources'],
          };
          const [label, desc] = labels[key];
          return (
            <SettingRow key={key} label={label} description={desc}>
              <Toggle value={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
            </SettingRow>
          );
        })}
      </Section>

      {/* ── PRIVACY ── */}
      <Section icon={Lock} color="bg-indigo-500/10 text-indigo-400" title="Privacy & Visibility">
        <p className="text-xs text-slate-500 -mt-2 mb-4">Control who can see your profile and how your data is used.</p>
        {(Object.keys(privacy) as (keyof typeof privacy)[]).map(key => {
          const labels: Record<keyof typeof privacy, [string, string]> = {
            publicProfile:     ['Public Profile',          'Allow others to view your profile page'],
            showCareerScore:   ['Show Career Score',       'Display your score on your public profile'],
            showSkills:        ['Show Skills',             'Make your skill list publicly visible'],
            allowDataAnalysis: ['Anonymous Data Analysis', 'Help improve AI by sharing anonymised usage data'],
            showInLeaderboard: ['College Leaderboard',     "Appear in your college\'s career leaderboard"],
          };
          const [label, desc] = labels[key];
          return (
            <SettingRow key={key} label={label} description={desc}>
              <Toggle value={privacy[key]} onChange={v => setPrivacy(p => ({ ...p, [key]: v }))} />
            </SettingRow>
          );
        })}
      </Section>

      {/* ── THEME ── */}
      <Section icon={Palette} color="bg-blue-500/10 text-blue-400" title="Appearance">
        {/* Theme selector */}
        <div>
          <p className="text-sm text-white font-medium mb-2">Color Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTheme(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                  ${theme === id
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}>
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-sm text-white font-medium mb-2">Accent Color</p>
          <div className="flex gap-2.5">
            {ACCENT_COLORS.map(c => (
              <button key={c} onClick={() => setAccentColor(c)}
                className={`h-7 w-7 rounded-full transition-all ${accentColor === c ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <SettingRow label="Compact Mode" description="Reduce padding and font sizes for denser layout">
          <Toggle value={compactMode} onChange={setCompactMode} />
        </SettingRow>
        <SettingRow label="Reduced Motion" description="Minimise animations and transitions">
          <Toggle value={reducedMotion} onChange={setReducedMotion} />
        </SettingRow>
      </Section>

      {/* ── DANGER ZONE ── */}
      <GlassCard className="border-rose-500/20 ring-1 ring-rose-500/10">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          {/* Sign out all devices */}
          <SettingRow
            label="Sign Out All Devices"
            description="Immediately revoke all active sessions across all devices.">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all">
              <LogOut className="h-3.5 w-3.5" /> Sign Out All
            </button>
          </SettingRow>

          {/* Delete account */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-sm font-medium text-white mb-1">Delete Account</p>
            <p className="text-xs text-slate-500 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30
                  text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
                <Trash2 className="h-4 w-4" /> Delete my account
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <p className="text-xs text-rose-300">
                  Type <strong className="font-mono">DELETE</strong> to confirm account deletion:
                </p>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-white/5 border border-rose-500/20 rounded-xl px-4 py-2.5 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                />
                <div className="flex gap-2">
                  <button
                    disabled={deleteInput !== 'DELETE'}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600
                      text-sm font-semibold text-white disabled:opacity-40 hover:bg-rose-500 transition-all">
                    <Trash2 className="h-4 w-4" /> Confirm Delete
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
