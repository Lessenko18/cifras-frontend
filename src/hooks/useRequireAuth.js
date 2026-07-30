import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MESSAGE = "Você precisa fazer login para continuar.";

// Retorna uma função que checa login antes de uma ação; se não estiver logado,
// avisa o usuário e manda pro login (guardando a página atual pra voltar depois).
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (message = DEFAULT_MESSAGE) => {
      if (isAuthenticated) return true;

      toast.error(message);
      navigate("/login", { state: { from: location.pathname } });
      return false;
    },
    [isAuthenticated, navigate, location],
  );
}
