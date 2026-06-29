// lib/auth.ts
// Responsibility: Firebase Auth instance accessor.
// Components and services import `auth` from here, never from firebase.ts directly.
// This indirection makes it easy to swap auth providers in the future.

// Module 2: import { getAuth } from 'firebase/auth';
// Module 2: import { app } from './firebase';
// Module 2: export const auth = getAuth(app);

export const auth = null; // placeholder until Module 2
