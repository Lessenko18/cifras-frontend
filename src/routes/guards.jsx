import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function AdminRoute({ children }) {
  const { isLoading, isAuthenticated, can } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!can("admin:access")) return <Navigate to="/home" replace />;
  return children;
}

// Rotas que exigem login (dashboard, playlists, perfil) — cifras continuam públicas.
export function RequireAuthRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
