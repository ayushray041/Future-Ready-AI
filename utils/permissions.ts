// utils/permissions.ts
// Responsibility: Role-based access control helpers.
// Checks user role against required permissions before rendering gated content.

import type { UserRole } from '@/types/user';

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function canAccessFeature(role: UserRole, feature: string): boolean {
  const adminOnly = ['analytics-export', 'user-management'];
  if (adminOnly.includes(feature)) return isAdmin(role);
  return true;
}
