import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { NavContainer, NavInner, NavContent, RightArea, UserArea } from "./NavbarStyled";
import { logout } from "../../service/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiSun, FiMoon, FiHome, FiMusic, FiList, FiUsers, FiTag, FiSearch } from "react-icons/fi";
import { normalizeAvatarUrl } from "../../utils/normalizeAvatarUrl";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, setUser } = useAuth();

  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);
  const { dark, toggle } = useTheme();

  const avatarUrl = normalizeAvatarUrl(user?.avatar || user?.photo || "");
  const showAvatar = Boolean(avatarUrl) && !avatarError;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

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
        <NavInner>
        <Link id="logo" to="/home">
          <img src="/tlcifras.png" alt="Logo TLCifras" />
        </Link>

        <NavContent>
          <NavLink to="/home" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiHome size={17} /> Home
          </NavLink>
          <NavLink to="/home/cifras" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiMusic size={17} /> Cifras
          </NavLink>
          <NavLink to="/home/playlists" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiList size={17} /> Playlists
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/home/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FiUsers size={17} /> Usuários
              </NavLink>
              <NavLink to="/home/categorias" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FiTag size={17} /> Categorias
              </NavLink>
            </>
          )}

          {!isAuthenticated && (
            <Link className="nav-link login-btn" to="/login">
              Entrar
            </Link>
          )}
        </NavContent>

        <RightArea>
          <Link to="/home/cifras" className="icon-btn" aria-label="Pesquisar músicas">
            <FiSearch size={18} />
          </Link>

          <button
            className="icon-btn theme-toggle"
            onClick={toggle}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated && (
            <UserArea ref={menuRef}>
              <button
                className="user-btn"
                onClick={() => setOpenMenu((s) => !s)}
                aria-expanded={openMenu}
              >
                {showAvatar ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || "Usuário"}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="initials">{initials}</span>
                )}
              </button>

              {openMenu && (
                <div className="user-menu">
                  <div className="user-info">
                    {showAvatar ? (
                      <img
                        src={avatarUrl}
                        alt={user.name || "Usuário"}
                        onError={() => setAvatarError(true)}
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
          )}
        </RightArea>
        </NavInner>
      </NavContainer>

      <Outlet />
    </>
  );
}
