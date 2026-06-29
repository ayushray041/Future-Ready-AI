'use client';
// hooks/useAuth.ts
// Thin wrapper so components import from a hook, never from context directly.

export { useAuthContext as useAuth } from '@/contexts/AuthContext';