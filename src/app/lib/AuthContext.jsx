"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseClient";

const AuthContext = createContext(null);
const LOCAL_ADMIN_SESSION_EVENT = "local-admin-session-changed";

function getLocalAdminUser() {
  if (typeof window === "undefined") return null;
  const isLocalAdmin = localStorage.getItem("localAdminSession") === "true";
  if (!isLocalAdmin) return null;
  return {
    uid: "local-admin",
    email: "admin@admin.com",
    displayName: "Admin",
    isLocalAdmin: true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => auth.currentUser || getLocalAdminUser(),
  );
  const [loading, setLoading] = useState(
    () => !(auth.currentUser || getLocalAdminUser()),
  );

  useEffect(() => {
    const syncLocalAdminFromStorage = () => {
      const adminUser = getLocalAdminUser();
      if (adminUser) {
        setUser(adminUser);
        setLoading(false);
        return true;
      }
      return false;
    };

    if (user?.isLocalAdmin) {
      const onStorage = (event) => {
        if (event.key !== "localAdminSession") return;
        if (event.newValue !== "true") {
          setUser(null);
        }
      };
      const onLocalAdminSessionChanged = () => {
        if (!syncLocalAdminFromStorage()) {
          setUser((currentUser) =>
            currentUser?.isLocalAdmin ? null : currentUser,
          );
        }
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener(
        LOCAL_ADMIN_SESSION_EVENT,
        onLocalAdminSessionChanged,
      );

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(
          LOCAL_ADMIN_SESSION_EVENT,
          onLocalAdminSessionChanged,
        );
      };
    }

    // Re-check localStorage on client mount (handles SSR hydration where
    // localStorage is unavailable during server render).
    if (syncLocalAdminFromStorage()) {
      return () => {};
    }

    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      resolved = true;
      clearTimeout(timeoutId);
      // Don't overwrite a local admin session that may have been set
      // between the SSR render and the firebase callback.
      if (!getLocalAdminUser()) {
        setUser(firebaseUser);
      }
      setLoading(false);
    });

    const onStorage = (event) => {
      if (event.key !== "localAdminSession") return;
      if (event.newValue === "true") {
        syncLocalAdminFromStorage();
      } else {
        setUser((currentUser) =>
          currentUser?.isLocalAdmin ? auth.currentUser || null : currentUser,
        );
      }
    };

    const onLocalAdminSessionChanged = () => {
      if (syncLocalAdminFromStorage()) return;
      setUser((currentUser) =>
        currentUser?.isLocalAdmin ? auth.currentUser || null : currentUser,
      );
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(
      LOCAL_ADMIN_SESSION_EVENT,
      onLocalAdminSessionChanged,
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        LOCAL_ADMIN_SESSION_EVENT,
        onLocalAdminSessionChanged,
      );
    };
  }, [user?.isLocalAdmin]);

  const logout = async () => {
    if (user?.isLocalAdmin) {
      localStorage.removeItem("localAdminSession");
      window.dispatchEvent(new Event(LOCAL_ADMIN_SESSION_EVENT));
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
