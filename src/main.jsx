import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.jsx";
import { GlobalStyled } from "./GlobalStyled.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

// Páginas carregadas imediatamente (fluxo crítico)
import Login from "./pages/Authentication/Login.jsx";
import Signup from "./pages/Authentication/Signup.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";
import ResetPassword from "./pages/Authentication/ResetPassword.jsx";
import Home from "./pages/Home/Home.jsx";

// Lazy: carregadas só quando o usuário navega até elas
const VerCifra    = lazy(() => import("./pages/VerCifra/VerCifra.jsx"));
const VerPlaylist = lazy(() => import("./pages/VerPlaylist/VerPlaylist.jsx"));
const Cifras      = lazy(() => import("./pages/Cifras/Cifra.jsx"));
const Playlist    = lazy(() => import("./pages/Playlist/Playlist.jsx"));
const Profile     = lazy(() => import("./pages/Users/Profile.jsx"));
const Users       = lazy(() => import("./pages/Users/Users.jsx"));
const Categorias  = lazy(() => import("./pages/Categoria/Categoria.jsx"));

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</span>
    </div>
  );
}

function AdminRoute({ children }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
}

// Rotas que exigem login (dashboard, playlists, perfil) — cifras continuam públicas.
function RequireAuthRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

const router = createBrowserRouter([
  // Página inicial é pública: mostra cifras (e um convite pra logar pra ver playlists).
  { path: "/",               element: <Navigate to="/home" replace /> },
  { path: "/login",          element: <Login /> },
  { path: "/signup",         element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/home",
    element: <Navbar />,
    children: [
      {
        // Pública: cifras são visíveis sem login; o painel de playlists mostra
        // um aviso pedindo login em vez de bloquear a rota inteira.
        path: "/home",
        element: <Home />,
      },
      {
        path: "/home/profile",
        element: (
          <RequireAuthRoute>
            <Suspense fallback={<PageLoader />}><Profile /></Suspense>
          </RequireAuthRoute>
        ),
      },
      {
        path: "/home/users",
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}><Users /></Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "/home/categorias",
        element: (
          <AdminRoute>
            <Suspense fallback={<PageLoader />}><Categorias /></Suspense>
          </AdminRoute>
        ),
      },
      {
        // Pública: ver e listar cifras não exige login.
        path: "/home/cifras",
        element: <Suspense fallback={<PageLoader />}><Cifras /></Suspense>,
      },
      {
        // Pública: ver uma cifra individual não exige login.
        path: "/home/cifra/:id",
        element: <Suspense fallback={<PageLoader />}><VerCifra /></Suspense>,
      },
      {
        path: "/home/playlists",
        element: (
          <RequireAuthRoute>
            <Suspense fallback={<PageLoader />}><Playlist /></Suspense>
          </RequireAuthRoute>
        ),
      },
      {
        path: "/home/playlists/:id/ver",
        element: (
          <RequireAuthRoute>
            <Suspense fallback={<PageLoader />}><VerPlaylist /></Suspense>
          </RequireAuthRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyled />
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster />
        <SpeedInsights />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
