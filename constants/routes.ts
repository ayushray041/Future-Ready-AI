// constants/routes.ts
// Responsibility: Single source of truth for all application route paths.
// Prevents magic strings scattered across the codebase.

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  MENTOR: '/mentor',
  ROADMAP: '/roadmap',
  OPPORTUNITIES: '/opportunities',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  INTERVIEW: '/interview',
  RESUME: '/resume',
  CAREER_TWIN: '/career-twin',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
