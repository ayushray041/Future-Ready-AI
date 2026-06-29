// services/auth.service.ts
// Responsibility: All Firebase Authentication operations (sign-in, sign-up,
// sign-out, password reset). Never called from components directly — use
// hooks/useAuth.ts instead.

export const authService = {
  async signIn(_email: string, _password: string): Promise<void> {
    // Module 2: import { signInWithEmailAndPassword } from 'firebase/auth'
  },
  async signUp(_email: string, _password: string): Promise<void> {
    // Module 2: createUserWithEmailAndPassword
  },
  async signOut(): Promise<void> {
    // Module 2: signOut
  },
  async resetPassword(_email: string): Promise<void> {
    // Module 2: sendPasswordResetEmail
  },
};
