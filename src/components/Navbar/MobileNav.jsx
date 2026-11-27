import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FiHome, FiMusic, FiList, FiMenu, FiTool, FiUsers, FiTag, FiInbox, FiUser, FiClock,
  FiHelpCircle, FiSun, FiMoon, FiLogOut, FiLogIn,
} from "react-icons/fi";
import { BottomBar, SheetOverlay, Sheet } from "./MobileNavStyled";

const ICON = 22;
const ITEM_ICON = 20;

// Esconde a barra ao rolar para BAIXO (mais espaço para ler a cifra) e mostra ao rolar para
// CIMA, no topo ou no fim da página. `lock` mantém a barra visível (ex.: folha "Mais" aberta).
function useHideOnScroll(lock) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY.current;
      const nearTop = y < 80;
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 40;

      if (nearTop || nearBottom || delta < -6) setHidden(false);
      else if (delta > 6) setHidden(true);
      if (Math.abs(delta) > 6) lastY.current = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden && !lock;
}

const linkClass = ({ isActive }) => (isActive ? "tab active" : "tab");

// Navegação mobile: barra inferior (Home · Cifras · Playlists · Mais) + folha "Mais"
// com o que não cabe na barra. Só aparece em telas estreitas (ver MobileNavStyled).
export default function MobileNav({ isAdmin, isAuthenticated, dark, onToggleTheme, onLogout }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const hidden = useHideOnScroll(open);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const moreRoutes = ["/home/ferramentas", "/home/users", "/home/categorias", "/home/feedbacks", "/home/profile", "/home/auditoria", "/home/ajuda"];
  const moreActive = moreRoutes.some((r) => pathname.startsWith(r));

  return (
    <>
      <BottomBar aria-label="Navegação principal" $hidden={hidden}>
        <NavLink to="/home" end className={linkClass}>
          <FiHome size={ICON} aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/home/cifras" className={linkClass}>
          <FiMusic size={ICON} aria-hidden="true" />
          <span>Cifras</span>
        </NavLink>
        <NavLink to="/home/playlists" className={linkClass}>
          <FiList size={ICON} aria-hidden="true" />
          <span>Playlists</span>
        </NavLink>
        <button
          type="button"
          className={open || moreActive ? "tab active" : "tab"}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((o) => !o)}
        >
          <FiMenu size={ICON} aria-hidden="true" />
          <span>Mais</span>
        </button>
      </BottomBar>

      {open && (
        <>
          <SheetOverlay onClick={() => setOpen(false)} />
          <Sheet role="dialog" aria-label="Mais opções">
            <div className="grip" aria-hidden="true" />
            <NavLink to="/home/ferramentas" className="item">
              <FiTool size={ITEM_ICON} aria-hidden="true" /> Ferramentas
            </NavLink>

            {isAdmin && (
              <>
                <p className="group">Administração</p>
                <NavLink to="/home/users" className="item"><FiUsers size={ITEM_ICON} aria-hidden="true" /> Usuários</NavLink>
                <NavLink to="/home/categorias" className="item"><FiTag size={ITEM_ICON} aria-hidden="true" /> Categorias</NavLink>
                <NavLink to="/home/feedbacks" className="item"><FiInbox size={ITEM_ICON} aria-hidden="true" /> Relatos</NavLink>
                <NavLink to="/home/auditoria" className="item"><FiClock size={ITEM_ICON} aria-hidden="true" /> Histórico de ações</NavLink>
              </>
            )}

            <p className="group">Conta e app</p>
            {isAuthenticated && (
              <NavLink to="/home/profile" className="item"><FiUser size={ITEM_ICON} aria-hidden="true" /> Perfil</NavLink>
            )}
            <NavLink to="/home/ajuda" className="item"><FiHelpCircle size={ITEM_ICON} aria-hidden="true" /> Ajuda</NavLink>
            <button type="button" className="item" onClick={onToggleTheme}>
              {dark ? <FiSun size={ITEM_ICON} aria-hidden="true" /> : <FiMoon size={ITEM_ICON} aria-hidden="true" />}
              {dark ? "Modo claro" : "Modo escuro"}
            </button>
            {isAuthenticated ? (
              <button type="button" className="item danger" onClick={onLogout}>
                <FiLogOut size={ITEM_ICON} aria-hidden="true" /> Sair
              </button>
            ) : (
              <Link to="/login" className="item"><FiLogIn size={ITEM_ICON} aria-hidden="true" /> Entrar</Link>
            )}
          </Sheet>
        </>
      )}
    </>
  );
}
