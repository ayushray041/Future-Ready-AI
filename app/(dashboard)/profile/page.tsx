'use client';

import { useState } from 'react';
import {
  User, Edit2, Plus, Trash2, Save, X, CheckCircle,
  GraduationCap, Briefcase, Award, Code, Star, Camera, Loader2,
} from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

/* ─────────────────────────────────────────────────────────────
   TYPES & DATA
───────────────────────────────────────────────────────────── */
interface Education {
  id: string; degree: string; institution: string; year: string; gpa: string; editing: boolean;
}
interface Experience {
  id: string; role: string; company: string; period: string; description: string; editing: boolean;
}
interface Certification {
  id: string; name: string; issuer: string; date: string; credentialUrl: string;
}
interface Achievement {
  id: string; title: string; description: string; date: string;
}

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'AWS', 'GCP', 'Docker', 'Kubernetes',
  'Data Structures', 'System Design', 'REST APIs', 'GraphQL', 'Git', 'CI/CD',
];

const INIT_EDUCATION: Education[] = [
  { id: 'e1', degree: 'B.Tech Computer Science Engineering', institution: 'NIT Warangal', year: '2023 – 2027', gpa: '8.4 / 10', editing: false },
];
const INIT_EXPERIENCE: Experience[] = [
  { id: 'x1', role: 'Full Stack Developer Intern', company: 'TechStartup Pvt Ltd', period: 'May 2024 – Jul 2024', description: 'Built a customer analytics dashboard using React + Node.js, reducing report generation time by 60%. Deployed on AWS with Docker.', editing: false },
];
const INIT_CERTS: Certification[] = [
  { id: 'c1', name: 'Google Cloud Digital Leader', issuer: 'Google Cloud', date: 'Jan 2024', credentialUrl: '#' },
  { id: 'c2', name: 'Meta Front-End Developer', issuer: 'Coursera / Meta', date: 'Nov 2023', credentialUrl: '#' },
];
const INIT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: '🥈 2nd Place – Smart India Hackathon 2024', description: 'Built an AI-powered crop disease detection app with 94% accuracy, serving 200+ farmers in the pilot.', date: 'Oct 2024' },
  { id: 'a2', title: '⭐ Google Summer of Code Contributor', description: 'Contributed ML feature to an open-source computer vision library. 3 PRs merged.', date: 'Aug 2024' },
  { id: 'a3', title: '🏆 LeetCode – 500+ Problems Solved', description: 'Achieved Knight badge (top 5%) on LeetCode with a max rating of 1876.', date: 'Ongoing' },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

/* ─────────────────────────────────────────────────────────────
   INLINE EDIT HELPERS
───────────────────────────────────────────────────────────── */
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-white
          placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  /* Basic info */
  const [editingBasic, setEditingBasic] = useState(false);
  const [basic, setBasic] = useState({
    name: 'Ayush Sharma', email: 'ayush.sharma@nit.ac.in',
    headline: 'AI Engineer in the making | DSA · ML · Open Source',
    college: 'NIT Warangal', year: '2nd Year', branch: 'CSE', location: 'Hyderabad, India',
    github: 'github.com/ayush', linkedin: 'linkedin.com/in/ayush', website: 'ayushsharma.dev',
    bio: 'Passionate about building AI systems that solve real-world problems. Currently exploring ML, open source, and cloud-native development. Looking for internships in AI/ML for Summer 2025.',
  });
  const [basicDraft, setBasicDraft] = useState(basic);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savedBasic, setSavedBasic] = useState(false);

  /* Skills */
  const [skills, setSkills] = useState<string[]>(['Python', 'React', 'TypeScript', 'Node.js', 'Machine Learning', 'SQL', 'Docker', 'Git', 'Data Structures', 'Next.js']);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  /* Education */
  const [education, setEducation] = useState<Education[]>(INIT_EDUCATION);

  /* Experience */
  const [experience, setExperience] = useState<Experience[]>(INIT_EXPERIENCE);

  /* Certs */
  const [certs, setCerts] = useState<Certification[]>(INIT_CERTS);

  /* Achievements */
  const [achievements] = useState<Achievement[]>(INIT_ACHIEVEMENTS);

  /* Active tab on mobile */
  type Tab = 'overview' | 'skills' | 'education' | 'experience' | 'certs';
  const [tab, setTab] = useState<Tab>('overview');

  /* ── Handlers ── */
  async function saveBasic() {
    setSavingBasic(true);
    await new Promise(r => setTimeout(r, 800));
    setBasic(basicDraft);
    setSavingBasic(false);
    setEditingBasic(false);
    setSavedBasic(true);
    setTimeout(() => setSavedBasic(false), 2000);
  }

  function toggleSkill(s: string) {
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  }

  function addEducation() {
    setEducation(p => [...p, { id: uid(), degree: '', institution: '', year: '', gpa: '', editing: true }]);
  }
  function updateEdu(id: string, key: keyof Education, val: string | boolean) {
    setEducation(p => p.map(e => e.id === id ? { ...e, [key]: val } : e));
  }
  function removeEdu(id: string) { setEducation(p => p.filter(e => e.id !== id)); }

  function addExperience() {
    setExperience(p => [...p, { id: uid(), role: '', company: '', period: '', description: '', editing: true }]);
  }
  function updateExp(id: string, key: keyof Experience, val: string | boolean) {
    setExperience(p => p.map(e => e.id === id ? { ...e, [key]: val } : e));
  }
  function removeExp(id: string) { setExperience(p => p.filter(e => e.id !== id)); }

  function addCert() {
    setCerts(p => [...p, { id: uid(), name: '', issuer: '', date: '', credentialUrl: '' }]);
  }
  function removeCert(id: string) { setCerts(p => p.filter(c => c.id !== id)); }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'certs', label: 'Certs & Awards' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Keep your profile updated — it powers your career score and opportunity matching."
        badge="Career Profile"
        action={
          savedBasic ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          ) : undefined
        }
      />

      {/* ── Profile hero ── */}
      <GlassCard padding="lg">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600
              flex items-center justify-center text-white text-2xl font-bold">
              {basic.name.split(' ').map(n => n[0]).join('')}
            </div>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-slate-800 border border-white/10
              flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Info */}
          {editingBasic ? (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name"   value={basicDraft.name}     onChange={v => setBasicDraft(p => ({ ...p, name: v }))} />
              <Field label="Email"       value={basicDraft.email}    onChange={v => setBasicDraft(p => ({ ...p, email: v }))} />
              <Field label="Headline"    value={basicDraft.headline} onChange={v => setBasicDraft(p => ({ ...p, headline: v }))} />
              <Field label="College"     value={basicDraft.college}  onChange={v => setBasicDraft(p => ({ ...p, college: v }))} />
              <Field label="Year"        value={basicDraft.year}     onChange={v => setBasicDraft(p => ({ ...p, year: v }))} />
              <Field label="Branch"      value={basicDraft.branch}   onChange={v => setBasicDraft(p => ({ ...p, branch: v }))} />
              <Field label="Location"    value={basicDraft.location} onChange={v => setBasicDraft(p => ({ ...p, location: v }))} />
              <Field label="GitHub"      value={basicDraft.github}   onChange={v => setBasicDraft(p => ({ ...p, github: v }))} />
              <Field label="LinkedIn"    value={basicDraft.linkedin} onChange={v => setBasicDraft(p => ({ ...p, linkedin: v }))} />
              <Field label="Website"     value={basicDraft.website}  onChange={v => setBasicDraft(p => ({ ...p, website: v }))} />
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Bio</label>
                <textarea value={basicDraft.bio} onChange={e => setBasicDraft(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 resize-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button onClick={saveBasic} disabled={savingBasic}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                    text-sm font-semibold text-white disabled:opacity-60 hover:from-cyan-400 hover:to-blue-500 transition-all">
                  {savingBasic ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
                <button onClick={() => { setEditingBasic(false); setBasicDraft(basic); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{basic.name}</h2>
                  <p className="text-sm text-cyan-400 mt-0.5">{basic.headline}</p>
                  <p className="text-xs text-slate-500 mt-1">{basic.college} · {basic.year} · {basic.branch} · {basic.location}</p>
                </div>
                <button onClick={() => setEditingBasic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5
                    text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">{basic.bio}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                {basic.github && <a href={`https://${basic.github}`} className="hover:text-cyan-400 transition-colors">{basic.github}</a>}
                {basic.linkedin && <a href={`https://${basic.linkedin}`} className="hover:text-cyan-400 transition-colors">{basic.linkedin}</a>}
                {basic.website && <a href={`https://${basic.website}`} className="hover:text-cyan-400 transition-colors">{basic.website}</a>}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Tab nav ── */}
      <div className="flex gap-1 overflow-x-auto border border-white/5 rounded-2xl p-1 bg-white/5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all
              ${tab === t.id ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/20' : 'text-slate-500 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SKILLS ── */}
      {tab === 'skills' && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Technical Skills</h3>
            <button onClick={() => setShowSkillPicker(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Plus className="h-3 w-3" /> {showSkillPicker ? 'Done' : 'Add Skills'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-cyan-500/10 text-cyan-300 text-xs font-medium ring-1 ring-cyan-500/20">
                <Code className="h-3 w-3" /> {s}
                <button onClick={() => toggleSkill(s)} className="text-cyan-600 hover:text-rose-400 transition-colors ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {showSkillPicker && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Click to add / remove:</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    className="px-3 py-1.5 rounded-full bg-white/5 text-slate-400 text-xs hover:bg-white/10 hover:text-white transition-all">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── EDUCATION ── */}
      {tab === 'education' && (
        <div className="space-y-3">
          {education.map(edu => (
            <GlassCard key={edu.id}>
              {edu.editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Degree / Program" value={edu.degree}      onChange={v => updateEdu(edu.id, 'degree', v)} />
                  <Field label="Institution"       value={edu.institution} onChange={v => updateEdu(edu.id, 'institution', v)} />
                  <Field label="Year"              value={edu.year}        onChange={v => updateEdu(edu.id, 'year', v)} />
                  <Field label="GPA / Percentage"  value={edu.gpa}         onChange={v => updateEdu(edu.id, 'gpa', v)} />
                  <div className="sm:col-span-2 flex gap-2">
                    <button onClick={() => updateEdu(edu.id, 'editing', false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => removeEdu(edu.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/20 text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{edu.degree}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{edu.institution}</p>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span>{edu.year}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                  <button onClick={() => updateEdu(edu.id, 'editing', true)}
                    className="text-slate-500 hover:text-slate-200 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
          <button onClick={addEducation}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-white/10
              text-sm text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all">
            <Plus className="h-4 w-4" /> Add Education
          </button>
        </div>
      )}

      {/* ── EXPERIENCE ── */}
      {tab === 'experience' && (
        <div className="space-y-3">
          {experience.map(exp => (
            <GlassCard key={exp.id}>
              {exp.editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Role / Title"  value={exp.role}    onChange={v => updateExp(exp.id, 'role', v)} />
                  <Field label="Company"        value={exp.company} onChange={v => updateExp(exp.id, 'company', v)} />
                  <Field label="Period"         value={exp.period}  onChange={v => updateExp(exp.id, 'period', v)} />
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Description</label>
                    <textarea value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} rows={3}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                        focus:outline-none focus:ring-1 focus:ring-cyan-500/40 resize-none" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button onClick={() => updateExp(exp.id, 'editing', false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => removeExp(exp.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/20 text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{exp.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{exp.company} · {exp.period}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                  <button onClick={() => updateExp(exp.id, 'editing', true)}
                    className="text-slate-500 hover:text-slate-200 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
          <button onClick={addExperience}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-white/10
              text-sm text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all">
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        </div>
      )}

      {/* ── CERTS & ACHIEVEMENTS ── */}
      {tab === 'certs' && (
        <div className="space-y-6">
          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" /> Certifications
              </h3>
              <button onClick={addCert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {certs.map(c => (
                <GlassCard key={c.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-4.5 w-4.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {c.name ? (
                        <>
                          <p className="text-sm font-semibold text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.issuer} · {c.date}</p>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Cert name" value={c.name} onChange={e => setCerts(p => p.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))}
                            className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40" />
                          <input placeholder="Issuer" value={c.issuer} onChange={e => setCerts(p => p.map(x => x.id === c.id ? { ...x, issuer: e.target.value } : x))}
                            className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40" />
                          <input placeholder="Date" value={c.date} onChange={e => setCerts(p => p.map(x => x.id === c.id ? { ...x, date: e.target.value } : x))}
                            className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40" />
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeCert(c.id)} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-cyan-400" /> Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map(a => (
                <GlassCard key={a.id} padding="sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{a.description}</p>
                      <p className="text-xs text-slate-600 mt-1">{a.date}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── OVERVIEW tab ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Code,         color: 'text-cyan-400',    label: 'Skills',        value: `${skills.length} listed`,                     tab: 'skills'     },
            { icon: GraduationCap,color: 'text-blue-400',    label: 'Education',     value: `${education.length} institution(s)`,            tab: 'education'  },
            { icon: Briefcase,    color: 'text-emerald-400', label: 'Experience',    value: `${experience.length} role(s)`,                  tab: 'experience' },
            { icon: Award,        color: 'text-amber-400',   label: 'Certifications',value: `${certs.length} certs · ${achievements.length} achievements`, tab: 'certs' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => setTab(item.tab as Tab)}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/60
                  backdrop-blur-xl hover:border-white/10 hover:bg-white/5 transition-all text-left group">
                <div className={`h-10 w-10 rounded-xl ${item.color.replace('text-', 'bg-').replace('400', '500/10')} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.value}</p>
                </div>
                <User className="h-4 w-4 text-slate-700 group-hover:text-slate-400 ml-auto transition-colors" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
