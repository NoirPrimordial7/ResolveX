import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/authApi";
import { setAuthToken } from "../api/axios";
import type { LoginPayload, RegisterPayload, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("resolvex_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveToken = useCallback((nextToken: string | null) => {
    setToken(nextToken);
    setAuthToken(nextToken);
    if (nextToken) {
      localStorage.setItem("resolvex_token", nextToken);
    } else {
      localStorage.removeItem("resolvex_token");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        await refreshUser();
      } catch {
        saveToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [refreshUser, saveToken, token]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      saveToken(response.access_token);
      setAuthToken(response.access_token);
      const currentUser = await authApi.me();
      setUser(currentUser);
      return currentUser;
    },
    [saveToken]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      return login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
  }, [saveToken]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
