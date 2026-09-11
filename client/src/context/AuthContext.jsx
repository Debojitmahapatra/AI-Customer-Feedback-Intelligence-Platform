import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const TOKEN_STORAGE_KEY = "loop_token";
const USER_STORAGE_KEY = "loop_user";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);

    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [isRestoring, setIsRestoring] = useState(Boolean(token));

  const clearAuthentication = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setToken(null);
    setUser(null);
  };

  const saveAuthentication = (authenticationData) => {
    const { token: newToken, user: newUser } = authenticationData;

    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsRestoring(false);

        return;
      }

      setIsRestoring(true);

      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data.data.user;

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        clearAuthentication();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [token]);

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    saveAuthentication(response.data.data);
  };

  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);

    saveAuthentication(response.data.data);
  };

  const logout = () => {
    clearAuthentication();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isRestoring,
      isAuthenticated: Boolean(user && token),
      register,
      login,
      logout,
    }),
    [user, token, isRestoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};