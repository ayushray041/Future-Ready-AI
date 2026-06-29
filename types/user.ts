// types/user.ts
// Responsibility: Central TypeScript types for the User domain.
// Shared across auth, Firestore, and UI components to ensure type safety.

export type UserRole = 'student' | 'admin';
export type CareerYear = '1st' | '2nd' | '3rd' | '4th';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  currentYear: CareerYear;
  targetCareer: string;
  branch: string;
  collegeName: string;
  careerScore: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
}
