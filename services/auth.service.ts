import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
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

  async changePassword(currentPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found.');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  },

  async deleteAccount(password?: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found.');
    }

    const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === 'password');
    if (hasPasswordProvider) {
      if (!password || !user.email) {
        throw new Error('Password confirmation is required to delete your account.');
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    await deleteUser(user);
  },
};