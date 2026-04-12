"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseClient";

import api from "./apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = Boolean(auth);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await api.get(`/api/auth/profile/${firebaseUser.uid}`);
          if (res.data.success) {
            setUserProfile(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch user profile in AuthContext:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const refreshUser = async () => {
    if (!auth) return;
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
      try {
        const res = await api.get(`/api/auth/profile/${auth.currentUser.uid}`);
        if (res.data.success) {
          setUserProfile(res.data.data);
        }
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    }
  };

  const value = {
    user,
    userProfile,
    role: userProfile?.role || null,
    loading,
    isAuthenticated: !!user,
    firebaseReady,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

