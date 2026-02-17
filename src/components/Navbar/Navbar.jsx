import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { NavContainer, NavContent, UserArea } from "./NavbarStyled";
import { logout } from "../../service/auth.service";
import { normalizeAvatarUrl } from "../../utils/normalizeAvatarUrl";

export function Navbar() {
  const [user, setUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) return stored;

    return {
      ...stored,
      avatar: normalizeAvatarUrl(stored.avatar),
      photo: normalizeAvatarUrl(stored.photo),
    };
  });

  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    function syncUser() {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (!stored) {
        setUser(stored);
        return;
      }

      setUser({
        ...stored,
        avatar: normalizeAvatarUrl(stored.avatar),
        photo: normalizeAvatarUrl(stored.photo),
      });
    }
    JSON.parse(localStorage.getItem("user"))?.avatar;

    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <NavContainer>
        <Link id="logo" to="/home">
          <img src="/tlcifras.png" alt="Logo TLCifras" />
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

                <Link to="/home/profile" onClick={() => setOpenMenu(false)}>
                  Perfil
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            )}
          </UserArea>
        </NavContent>
      </NavContainer>

      <Outlet />
    </>
  );
}
