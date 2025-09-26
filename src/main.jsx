import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import { GlobalStyled } from "./GlobalStyled.jsx";
import Authentication from "./pages/Authentication/Authentication.jsx";
import Users from "./pages/Users/Users.jsx";
import Categorias from "./pages/Categoria/Categoria.jsx";
import Cifras from "./pages/Cifras/Cifra.jsx";
import Playlist from "./pages/Playlist/Playlist.jsx";
import VerCifra from "./pages/VerCifra/VerCifra.jsx";
import { Toaster } from "react-hot-toast";
import VerPlaylist from "./pages/VerPlaylist/VerPlaylist.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Authentication />,
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
        path: "/home/users",
        element: <Users />,
      },
      {
        path: "/home/categorias",
        element: <Categorias />,
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
  </React.StrictMode>
);
