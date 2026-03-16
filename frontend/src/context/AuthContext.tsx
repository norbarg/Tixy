import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../utils/tokenStorage';
import type { User } from '../types/auth.types';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (payload: { loginOrEmail: string; password: string }) => Promise<void>;
  register: (payload: {
    login: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openAuthModal = () => setIsAuthModalOpen(true);

  const applyAuth = (data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => {
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const login = async (payload: { loginOrEmail: string; password: string }) => {
    const data = await authApi.login(payload);
    applyAuth(data);
    closeAuthModal();
  };

  const register = async (payload: {
    login: string;
    email: string;
    password: string;
  }) => {
    const data = await authApi.register(payload);
    applyAuth(data);
    closeAuthModal();
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore backend logout error
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  const bootstrapAuth = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      if (!refreshToken) {
        tokenStorage.clearTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const refreshed = await authApi.refresh(refreshToken);
        applyAuth(refreshed);
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
    }),
    [user, isLoading, isAuthModalOpen, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
