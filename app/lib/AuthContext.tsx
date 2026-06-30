'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  dbUser: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  dbUser: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserToDatabase(firebaseUser);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncUserToDatabase = async (firebaseUser: User) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          googleId: firebaseUser.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbUser(data.user);
      }
    } catch (error: any) {
      console.error("DB Sync error:", error.message);
    }
  };

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = (result as any)._tokenResponse?.oauthAccessToken;
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem('googleAccessToken', token);
      }
      await syncUserToDatabase(result.user);
    } catch (error: any) {
      console.error("Sign in error:", error.message);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAccessToken(null);
    setDbUser(null);
    sessionStorage.removeItem('googleAccessToken');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, dbUser, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);