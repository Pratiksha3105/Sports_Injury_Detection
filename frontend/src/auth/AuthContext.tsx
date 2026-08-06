import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiLogin, apiLogout, apiRefresh, apiRegister } from "./authApi";
import { registerSessionExpiredHandler, setAccessToken } from "./tokenStore";
import type { AuthUser, Role } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  /** True only while the app is doing its very first silent-refresh check. */
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { full_name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleSessionExpired = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  // On first load there's no access token in memory (a hard refresh wipes
  // it), but the httpOnly refresh cookie may still be valid — try a silent
  // refresh so the user doesn't get bounced to /login on every page reload.
  useEffect(() => {
    let cancelled = false;
    apiRefresh()
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.access_token);
        setUser(res.user);
      })
      .catch(() => {
        if (!cancelled) setAccessToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAccessToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (data: { full_name: string; email: string; password: string; role: Role }) => {
      const res = await apiRegister(data);
      setAccessToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback((updated: AuthUser) => setUser(updated), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isInitializing, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
