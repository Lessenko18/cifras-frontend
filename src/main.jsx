import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import { GlobalStyled } from "./GlobalStyled.jsx";
import Login from "./pages/Authentication/Login.jsx";
import Signup from "./pages/Authentication/Signup.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";
import Users from "./pages/Users/Users.jsx";
import Profile from "./pages/Users/Profile.jsx";
import Categorias from "./pages/Categoria/Categoria.jsx";
import Cifras from "./pages/Cifras/Cifra.jsx";
import Playlist from "./pages/Playlist/Playlist.jsx";
import VerCifra from "./pages/VerCifra/VerCifra.jsx";
import { Toaster } from "react-hot-toast";
import VerPlaylist from "./pages/VerPlaylist/VerPlaylist.jsx";

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.level !== "ADM") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/home",
    element: <Navbar />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/home/profile",
        element: <Profile />,
      },
      {
        path: "/home/users",
        element: (
          <AdminRoute>
            <Users />
          </AdminRoute>
        ),
      },
      {
        path: "/home/categorias",
        element: (
          <AdminRoute>
            <Categorias />
          </AdminRoute>
        ),
      },

      {
        path: "/home/cifras",
        element: <Cifras />,
      },
      {
        path: "/home/cifra/:id",
        element: <VerCifra />,
      },
      {
        path: "/home/playlists",
        element: <Playlist />,
      },
      {
        path: "/home/playlists/:id/ver",
        element: <VerPlaylist />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalStyled />
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>,
);
