'use client';
// contexts/AuthContext.tsx
// Subscribes to Firebase onAuthStateChanged, hydrates the UserProfile from
// Firestore, and exposes everything to the component tree.
// Wrap the root layout (or dashboard layout) with <AuthProvider>.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/services/user.service';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  firebaseUser: User | null;
  profile:      UserProfile | null;
  loading:      boolean;
  /** Call after updating the Firestore profile so the context stays fresh */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser:   null,
  profile:        null,
  loading:        true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [loading,      setLoading]      = useState(true);

  async function loadProfile(user: User) {
    try {
      const p = await getUser(user.uid);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function refreshProfile() {
    const user = auth.currentUser;
    if (user) await loadProfile(user);
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}