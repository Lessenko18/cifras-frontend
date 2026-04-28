import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.jsx";
import { GlobalStyled } from "./GlobalStyled.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { getMeRequest } from "./service/auth.service";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAdminAccess() {
      try {
        const user = await getMeRequest();
        const level = String(user?.level || "").toUpperCase();
        if (isMounted) setIsAdmin(level === "ADM");
      } catch {
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkAdminAccess();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: "/",               element: <Login /> },
  { path: "/login",          element: <Login /> },
  { path: "/signup",         element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/home",
    element: <Navbar />,
    children: [
      { path: "/home", element: <Home /> },
      {
        path: "/home/profile",
        element: <Suspense fallback={<PageLoader />}><Profile /></Suspense>,
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
        path: "/home/cifras",
        element: <Suspense fallback={<PageLoader />}><Cifras /></Suspense>,
      },
      {
        path: "/home/cifra/:id",
        element: <Suspense fallback={<PageLoader />}><VerCifra /></Suspense>,
      },
      {
        path: "/home/playlists",
        element: <Suspense fallback={<PageLoader />}><Playlist /></Suspense>,
      },
      {
        path: "/home/playlists/:id/ver",
        element: <Suspense fallback={<PageLoader />}><VerPlaylist /></Suspense>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <GlobalStyled />
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toaster />
      <SpeedInsights />
    </ThemeProvider>
  </React.StrictMode>,
);
