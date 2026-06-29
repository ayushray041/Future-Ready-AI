// constants/careers.ts
// Responsibility: Predefined list of target career roles for onboarding and filtering.

export const CAREER_ROLES = [
  'AI Engineer',
  'Software Development Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Full Stack Developer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Product Manager',
  'Cybersecurity Engineer',
  'Blockchain Developer',
] as const;

export type CareerRole = (typeof CAREER_ROLES)[number];
