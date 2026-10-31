import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMeRequest } from "../service/auth.service";
import { normalizeAvatarUrl } from "../utils/normalizeAvatarUrl";
import { storage } from "../lib/storage";
import { meKey } from "../lib/authKeys";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    avatar: normalizeAvatarUrl(user.avatar),
    photo: normalizeAvatarUrl(user.photo),
  };
}

// Cópia do usuário guardada no aparelho SÓ para o app abrir sem rede (PWA offline).
// Quem manda é o servidor (/auth/me via React Query); esta cópia só semeia o cache.
function readStoredUser() {
  try {
    return normalizeUser(JSON.parse(storage.get("user")));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  // `hasToken` vem do localStorage (não é estado do React) e o login/logout mexem
  // no cache por fora de qualquer observer (clear + setQueryData). Por isso o
  // provider re-renderiza a cada mudança da query do usuário.
  // Só eventos que mudam o dado (added/updated/removed). Os eventos de "observer*"
  // disparam a cada render do próprio useQuery e causariam um loop infinito.
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(
    () =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event.query.queryKey[0] !== meKey[0]) return;
        if (event.type === "added" || event.type === "updated" || event.type === "removed") rerender();
      }),
    [queryClient],
  );

  // Sem token local nem tenta buscar — evita 401 desnecessário para visitantes
  const hasToken = Boolean(storage.get("access_token"));

  const { data, dataUpdatedAt, isError } = useQuery({
    queryKey: meKey,
    queryFn: getMeRequest,
    enabled: hasToken,
    // Semente offline marcada como "velha" (updatedAt 0): rebusca ao abrir, mas
    // se a rede falhar o usuário continua logado em vez de ser deslogado.
    initialData: () => (hasToken ? readStoredUser() ?? undefined : undefined),
    initialDataUpdatedAt: 0,
    retry: false,
  });

  const user = hasToken ? data ?? null : null;

  useEffect(() => {
    if (user) storage.set("user", JSON.stringify(user));
  }, [user]);

  const setUser = useCallback(
    (next) => {
      if (next) {
        queryClient.setQueryData(meKey, normalizeUser(next));
      } else {
        queryClient.removeQueries({ queryKey: meKey });
      }
    },
    [queryClient],
  );

  const refresh = useCallback(async () => {
    if (!storage.get("access_token")) {
      setUser(null);
      return null;
    }
    try {
      return await queryClient.fetchQuery({ queryKey: meKey, queryFn: getMeRequest, staleTime: 0 });
    } catch {
      return null;
    }
  }, [queryClient, setUser]);

  // Carregando = ainda não houve a 1ª resposta do servidor nesta sessão
  const isLoading = hasToken && dataUpdatedAt === 0 && !isError;
  const isAdmin = String(user?.level || "").toUpperCase() === "ADM";
  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated, isAdmin, refresh, setUser }),
    [user, isLoading, isAuthenticated, isAdmin, refresh, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
