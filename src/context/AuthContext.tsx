import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPropertyManager: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null,
  loading: true, 
  isAdmin: false,
  isSuperAdmin: false,
  isPropertyManager: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create user profile
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          // Create default profile for first-time sign-in
          // For demo purposes, we can make the first user a super_admin if we want, 
          // but usually it's 'guest' by default.
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Guest',
            role: user.email === 'admin@inkindi.com' ? 'super_admin' : 'guest'
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const role = profile?.role || 'guest';
  const isSuperAdmin = role === 'super_admin';
  const isPropertyManager = role === 'property_manager';
  const isAdmin = isSuperAdmin || isPropertyManager;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      isAdmin,
      isSuperAdmin,
      isPropertyManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
