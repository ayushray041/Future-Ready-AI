// constants/branches.ts
// Responsibility: Engineering branch options used in onboarding and profile forms.

export const BRANCHES = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Data Science',
  'Artificial Intelligence & ML',
] as const;

export type Branch = (typeof BRANCHES)[number];
