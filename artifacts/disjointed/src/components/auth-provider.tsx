import { createContext, useContext, useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import {
  clearStoredAuth,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  readStoredAuth,
  registerUser,
  writeStoredAuth,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (input: { username: string; password: string }) => Promise<AuthSession>;
  register: (input: {
    fullName: string;
    idNumber: string;
    username: string;
    password: string;
  }) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setSession(stored);

    fetchCurrentUser(stored.token)
      .then((result) => {
        if (cancelled) {
          return;
        }

        const refreshedSession = {
          token: stored.token,
          user: result.user,
        };
        writeStoredAuth(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearStoredAuth();
        clearCart();
        setSession(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearCart]);

  useEffect(() => {
    setAuthTokenGetter(() => session?.token ?? null);
    return () => {
      setAuthTokenGetter(null);
    };
  }, [session?.token]);

  const login = async (input: { username: string; password: string }) => {
    const nextSession = await loginUser(input);
    writeStoredAuth(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const register = async (input: {
    fullName: string;
    idNumber: string;
    username: string;
    password: string;
  }) => {
    const nextSession = await registerUser(input);
    writeStoredAuth(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    const activeToken = session?.token;
    clearStoredAuth();
    clearCart();
    setSession(null);

    if (activeToken) {
      await logoutUser(activeToken).catch(() => undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user: session?.user ?? null,
        token: session?.token ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
