// constants/skills.ts
// Responsibility: Canonical skill list used for tagging, filtering, and AI prompts.

export const SKILLS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Next.js',
  'Data Structures & Algorithms',
  'Machine Learning',
  'Deep Learning',
  'Cloud Computing',
  'Docker',
  'Kubernetes',
  'SQL',
  'NoSQL',
  'System Design',
  'Git',
  'REST APIs',
  'GraphQL',
] as const;

export type Skill = (typeof SKILLS)[number];
