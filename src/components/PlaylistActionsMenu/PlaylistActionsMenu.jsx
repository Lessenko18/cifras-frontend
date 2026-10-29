import { useRef, useState } from "react";
import styled from "styled-components";
import { FiEdit2, FiMoreVertical, FiShare2, FiTrash2 } from "react-icons/fi";
import { useClickOutside } from "../../hooks/useClickOutside";

const Wrap = styled.div`
  position: absolute;
  top: 10px;
  right: 8px;
  z-index: 2;

  .gatilho {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.28);
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  .menu {
    position: absolute;
    top: 34px;
    right: 0;
    min-width: 150px;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .menu button {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
  }

  .menu button:hover {
    background: var(--bg-input);
  }

  .menu button.perigo {
    color: var(--danger);
  }
`;

/**
 * Menu "⋯" do card de playlist: Compartilhar, Editar e Excluir (só o que o usuário
 * pode fazer). Posiciona-se no canto do card: o card precisa ter position: relative.
 * Usado na Home e na página Playlists.
 */
export default function PlaylistActionsMenu({ playlist, canShare, canEdit, canDelete, onShare, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  if (!canShare && !canEdit && !canDelete) return null;

  const run = (fn) => () => {
    setOpen(false);
    fn(playlist);
  };

  return (
    // o clique aqui não pode "vazar" para o card (que abre a playlist)
    <Wrap ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="gatilho"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FiMoreVertical size={16} />
      </button>
      {open && (
        <div className="menu" role="menu">
          {canShare && (
            <button type="button" role="menuitem" onClick={run(onShare)}>
              <FiShare2 size={14} /> Compartilhar
            </button>
          )}
          {canEdit && (
            <button type="button" role="menuitem" onClick={run(onEdit)}>
              <FiEdit2 size={14} /> Editar
            </button>
          )}
          {canDelete && (
            <button type="button" role="menuitem" className="perigo" onClick={run(onDelete)}>
              <FiTrash2 size={14} /> Excluir
            </button>
          )}
        </div>
      )}
    </Wrap>
  );
}
