"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import PhoneAuthModal from "@/components/PhoneAuthModal";

export interface AuthUser {
  uid: string;
  phone: string;
  role: "USER" | "ADMIN";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void) => void;
  setUserSession: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  requireAuth: () => {},
  setUserSession: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Initialize session from localStorage and Firebase Auth state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("inshuti_user_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.uid) {
          setUser(parsed);
        }
      }
    } catch {
      // Storage fallback
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const authUser: AuthUser = {
            uid: fbUser.uid,
            phone: fbUser.phoneNumber || "+250788000000",
            role: (localStorage.getItem("admin_authenticated") === "true") ? "ADMIN" : "USER",
          };
          setUser(authUser);
          try {
            localStorage.setItem("inshuti_user_session", JSON.stringify(authUser));
          } catch {}
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (onSuccessCallback?: () => void) => {
    if (onSuccessCallback) {
      setPendingCallback(() => onSuccessCallback);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      openAuthModal(action);
    }
  };

  const setUserSession = (newSession: AuthUser | null) => {
    setUser(newSession);
    try {
      if (newSession) {
        localStorage.setItem("inshuti_user_session", JSON.stringify(newSession));
      } else {
        localStorage.removeItem("inshuti_user_session");
      }
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("inshuti_user_session");
      localStorage.removeItem("admin_authenticated");
    } catch {}
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUserSession(authenticatedUser);
    setIsAuthModalOpen(false);
    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      cb();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        setUserSession,
        logout,
      }}
    >
      {children}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
