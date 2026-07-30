import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { NavContainer, NavContent, UserArea } from "./NavbarStyled";
import { logout } from "../../service/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, setUser } = useAuth();

  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const { dark, toggle } = useTheme();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }
    if (openMenu) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openMenu]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setOpenMenu(false);
    navigate("/login");
  };

  return (
    <>
      <NavContainer>
        <Link id="logo" to="/home">
          <img src="/tlcifras.png" alt="Logo TLCifras" />
        </Link>

        <NavContent>
          <NavLink to="/home" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/home/cifras" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Cifras</NavLink>
          <NavLink to="/home/playlists" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Playlists</NavLink>

          {isAdmin && (
            <>
              <NavLink to="/home/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Usuários</NavLink>
              <NavLink to="/home/categorias" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Categorias</NavLink>
            </>
          )}

          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {isAuthenticated ? (
            <UserArea ref={menuRef}>
              <button
                className="user-btn"
                onClick={() => setOpenMenu((s) => !s)}
                aria-expanded={openMenu}
              >
                {user?.avatar || user?.photo ? (
                  <img
                    src={user.avatar || user.photo}
                    alt={user.name || "Usuário"}
                  />
                ) : (
                  <span className="initials">{initials}</span>
                )}
              </button>

              {openMenu && (
                <div className="user-menu">
                  <div className="user-info">
                    {user?.avatar || user?.photo ? (
                      <img
                        src={user.avatar || user.photo}
                        alt={user.name || "Usuário"}
                      />
                    ) : (
                      <div className="initials big">{initials}</div>
                    )}
                    <div className="meta">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <Link
                    className="perfil-btn"
                    to="/home/profile"
                    onClick={() => setOpenMenu(false)}
                  >
                    Perfil
                  </Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              )}
            </UserArea>
          ) : (
            <Link className="nav-link login-btn" to="/login">
              Entrar
            </Link>
          )}
        </NavContent>
      </NavContainer>

      <Outlet />
    </>
  );
}
