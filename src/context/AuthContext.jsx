'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, loginUser, logoutUser, createAccount, createUserProfile, getUserProfile } from '@/lib/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // Appwrite account obj
  const [profile, setProfile] = useState(null);   // Firestore/Appwrite DB user doc
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load current session on mount
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        setUser(u);
        const p = await getUserProfile(u.$id);
        setProfile(p);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    // Check if already logged in with a valid session
    let u = await getCurrentUser();
    if (u) {
      setUser(u);
      let p = await getUserProfile(u.$id);
      if (!p) {
        p = await createUserProfile(u.$id, u.name || 'Student', email, 4);
      }
      setProfile(p);
      return u;
    }
    // No existing session — create one
    const session = await loginUser(email, password);
    u = await getCurrentUser();
    // Fallback: if cookies don't work (cross-domain), use session data
    if (!u && session) {
      u = { $id: session.userId, name: '', email };
    }
    if (!u) throw new Error('Login failed. Please try again.');
    setUser(u);
    let p = await getUserProfile(u.$id);
    if (!p) {
      p = await createUserProfile(u.$id, u.name || 'Student', email, 4);
    }
    setProfile(p);
    return u;
  };

  const signup = async (email, password, name, classNum) => {
    // Clear any existing session first
    try { await logoutUser(); } catch {}
    try {
      await createAccount(email, password, name);
    } catch (err) {
      if (!err.message?.includes('already exists')) throw err;
    }
    const session = await loginUser(email, password);
    let u = await getCurrentUser();
    // Fallback: if cookies don't work (cross-domain), use session data
    if (!u && session) {
      u = { $id: session.userId, name, email };
    }
    if (!u) throw new Error('Signup failed. Please try again.');
    setUser(u);
    let p = await getUserProfile(u.$id);
    if (!p) {
      p = await createUserProfile(u.$id, name, email, classNum);
    }
    setProfile(p);
    return u;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    router.push('/');
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getUserProfile(user.$id);
    setProfile(p);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
