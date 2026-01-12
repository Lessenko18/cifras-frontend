import { Link, Outlet } from "react-router-dom";
import { NavContainer, NavContent } from "./NavbarStyled";

export function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("USER LOGADO:", user);
  console.log("LEVEL:", user?.level);

  return (
    <>
      <NavContainer>
        <Link id="logo" to="/home">
          <img src="/LogoCaritas.png" alt="Logo Cáritas" />
        </Link>

        <NavContent>
          <Link to="/home">Home</Link>
          <Link to="/home/cifras">Cifras</Link>
          <Link to="/home/playlists">Playlists</Link>

          {user?.level === "ADM" && (
            <>
              <Link to="/home/users">Usuários</Link>
              <Link to="/home/categorias">Categorias</Link>
            </>
          )}
        </NavContent>
      </NavContainer>

      <Outlet />
    </>
  );
}
