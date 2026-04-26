"use client";

import * as Sentry from "@sentry/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { AuthUser } from "../_lib/auth";

interface UserContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store"
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as { user: AuthUser };
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role
    });
    Sentry.setTag("user.role", user.role);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      refreshUser,
      setUser
    }),
    [isLoading, refreshUser, user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
