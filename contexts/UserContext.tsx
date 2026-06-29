// contexts/UserContext.tsx
// Responsibility: Stores extended user profile data fetched from Firestore
// (separate from raw Firebase auth). Consumed via useUser hook (Module 2).

'use client';

import { createContext, useContext, useState } from 'react';
import type { UserProfile } from '@/types/user';

interface UserContextValue {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  setProfile: () => {},
});

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
}
