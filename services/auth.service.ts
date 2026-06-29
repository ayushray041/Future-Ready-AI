import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export const authService = {
  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    return signOut(auth);
  },

  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  },
};