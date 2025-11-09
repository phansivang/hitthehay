import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storageService } from '@/shared/lib/utils/storage';

export type UserRole = 'guest' | 'user' | 'admin';

export interface AuthUser {
  readonly username: string;
  readonly role: UserRole;
}

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly signIn: (user: AuthUser) => void;
  readonly signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Initialize from storage on mount
    return storageService.get<AuthUser>('app_auth_user');
  });

  const signIn = (nextUser: AuthUser) => {
    setUser(nextUser);
    storageService.set('app_auth_user', nextUser);
  };

  const signOut = () => {
    setUser(null);
    storageService.remove('app_auth_user');
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
};





