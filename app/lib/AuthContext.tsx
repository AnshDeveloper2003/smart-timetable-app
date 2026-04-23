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
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = (result as any)._tokenResponse?.oauthAccessToken;
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem('googleAccessToken', token);
      }
    } catch (error: any) {
      console.error("Sign in error:", error.message);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAccessToken(null);
    sessionStorage.removeItem('googleAccessToken');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);