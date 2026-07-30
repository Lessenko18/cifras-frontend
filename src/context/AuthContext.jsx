import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMeRequest } from "../service/auth.service";
import { normalizeAvatarUrl } from "../utils/normalizeAvatarUrl";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) return null;
    return {
      ...stored,
      avatar: normalizeAvatarUrl(stored.avatar),
      photo: normalizeAvatarUrl(stored.photo),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Sem token local, nem tenta — evita 401 desnecessário para visitantes
    if (!localStorage.getItem("access_token")) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const me = await getMeRequest();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function syncFromStorage() {
      setUser(readStoredUser());
    }
    window.addEventListener("userUpdated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("userUpdated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const isAdmin = String(user?.level || "").toUpperCase() === "ADM";
  const isAuthenticated = Boolean(user);

  const value = { user, isLoading, isAuthenticated, isAdmin, refresh, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
