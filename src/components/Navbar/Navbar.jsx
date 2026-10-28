import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { NavContainer, NavInner, NavContent, RightArea, UserArea, SearchBox } from "./NavbarStyled";
import { logout } from "../../service/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiSun, FiMoon, FiHome, FiMusic, FiList, FiUsers, FiTag, FiSearch, FiTool, FiInbox } from "react-icons/fi";
import Onboarding from "../Onboarding/Onboarding";
import { PageShell, PageContent } from "../Footer/FooterStyled";
import { Footer } from "../Footer/Footer";
import { normalizeAvatarUrl } from "../../utils/normalizeAvatarUrl";
import { PageSearchProvider, usePageSearchConfig } from "../../context/PageSearchContext";

export function Navbar() {
  return (
    <PageSearchProvider>
      <NavbarContent />
    </PageSearchProvider>
  );
}

function NavbarContent() {
  const { user, isAuthenticated, isAdmin, setUser } = useAuth();
  const pageSearch = usePageSearchConfig();

  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);
  const { dark, toggle } = useTheme();

  // Atalho de busca: "/" ou Ctrl+K foca o campo de busca da página; fora das
  // telas com busca, leva para a lista de cifras já com o campo focado.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (!isCtrlK && (e.key !== "/" || typing || e.ctrlKey || e.metaKey || e.altKey)) return;
      e.preventDefault();
      const field = document.querySelector("[data-global-search]");
      if (field) field.focus();
      else navigate("/home/cifras", { state: { focusSearch: true } });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    if (location.state?.focusSearch) document.querySelector("[data-global-search]")?.focus();
  }, [location.state, pageSearch]);

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
    <PageShell>
      <Onboarding />
      <NavContainer>
        <NavInner>
        <Link id="logo" to="/home">
          <img src="/tlcifras.webp" alt="Logo TLCifras" />
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
          <NavLink to="/home/ferramentas" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FiTool size={17} /> Ferramentas
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/home/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FiUsers size={17} /> Usuários
              </NavLink>
              <NavLink to="/home/categorias" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FiTag size={17} /> Categorias
              </NavLink>
              <NavLink to="/home/feedbacks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FiInbox size={17} /> Relatos
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
          {pageSearch ? (
            <SearchBox>
              <FiSearch size={16} />
              <input
                type="text"
                data-global-search
                placeholder={`${pageSearch.placeholder} ( / )`}
                value={pageSearch.value}
                onChange={(e) => pageSearch.onChange(e.target.value)}
                aria-label={pageSearch.placeholder}
              />
            </SearchBox>
          ) : (
            <Link to="/home/cifras" className="icon-btn" aria-label="Pesquisar músicas">
              <FiSearch size={18} />
            </Link>
          )}

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
                  {isAdmin && (
                    <Link
                      className="perfil-btn"
                      to="/home/auditoria"
                      onClick={() => setOpenMenu(false)}
                    >
                      Histórico de ações
                    </Link>
                  )}
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

      <PageContent>
        <Outlet />
      </PageContent>
      <Footer />
    </PageShell>
  );
}
