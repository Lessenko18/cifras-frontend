import { useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import toast from "react-hot-toast";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { createPlaylistService, editPlaylistService } from "../../service/playlistService";
import { playlistsKey, usePlaylists } from "../../hooks/queries/usePlaylists";
import { useAuth } from "../../context/AuthContext";

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  flex-shrink: 0;
  margin-left: auto; /* encosta à direita, junto do coração */
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

const Sheet = styled.div`
  position: fixed;
  z-index: 1001;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(360px, calc(100vw - 32px));
  max-height: 80vh;
  overflow-y: auto;
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  font-family: Inter, "Roboto", system-ui, sans-serif;

  h3 {
    margin: 0 0 4px;
    font-size: 1.05rem;
  }
  .sub {
    margin: 0 0 12px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  ul {
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  li button,
  .nova button,
  .fechar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 44px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--tom-btn-bg);
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
  }
  li button.on {
    border-color: var(--brand);
    background: color-mix(in srgb, var(--brand) 14%, transparent);
  }
  .nova {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
  }
  .nova input {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-primary);
  }
  .nova button {
    width: auto;
  }
`;

const idOf = (c) => (typeof c === "string" ? c : c?._id);

// Botão "+" que abre a lista de playlists do usuário para marcar/desmarcar a cifra.
export default function AddToPlaylist({ cifraId, cifraNome, className }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  // só busca quando o seletor abre; reaproveita o cache da Home/Playlists
  const playlistsQuery = usePlaylists({ enabled: isAuthenticated && open });
  const playlists = playlistsQuery.data ?? null;
  const [busy, setBusy] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  if (!isAuthenticated) return null;

  function openSheet(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  // atualiza o cache na hora (check/uncheck instantâneo) e depois confirma no servidor
  const patchPlaylists = (fn) => queryClient.setQueryData(playlistsKey, (list) => fn(list || []));

  async function toggle(pl) {
    if (busy) return;
    const ids = (pl.cifras || []).map(idOf);
    const has = ids.includes(cifraId);
    const next = has ? ids.filter((i) => i !== cifraId) : [...ids, cifraId];
    setBusy(true);
    try {
      await editPlaylistService(pl._id, { cifras: next });
      patchPlaylists((list) => list.map((p) => (p._id === pl._id ? { ...p, cifras: next } : p)));
      toast.success(has ? `Removida de “${pl.nome}”` : `Adicionada a “${pl.nome}”`);
    } catch {
      toast.error("Não foi possível atualizar a playlist.");
    } finally {
      setBusy(false);
    }
  }

  async function criar(e) {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome || busy) return;
    setBusy(true);
    try {
      const res = await createPlaylistService({ nome, cifras: [cifraId] });
      patchPlaylists((list) => [res.data, ...list]);
      setNovoNome("");
      toast.success(`Playlist “${nome}” criada com a cifra.`);
    } catch {
      toast.error("Não foi possível criar a playlist.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Trigger
        type="button"
        className={className}
        aria-label={`Adicionar ${cifraNome || "cifra"} à playlist`}
        title="Adicionar à playlist"
        onClick={openSheet}
      >
        <FiPlus size={14} />
      </Trigger>
      {/* Portal no body: dentro do card, o transform do hover prenderia o
          position:fixed ao card (piscando) e os cliques vazariam para o <Link>. */}
      {open &&
        createPortal(
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Overlay onClick={() => setOpen(false)} />
          <Sheet role="dialog" aria-label="Adicionar à playlist">
            <h3>Adicionar à playlist</h3>
            {cifraNome && <p className="sub">{cifraNome}</p>}
            {playlists === null ? (
              <p className="sub">{playlistsQuery.isError ? "Não foi possível carregar suas playlists." : "Carregando…"}</p>
            ) : (
              <ul>
                {playlists.map((pl) => {
                  const on = (pl.cifras || []).map(idOf).includes(cifraId);
                  return (
                    <li key={pl._id}>
                      <button type="button" className={on ? "on" : ""} aria-pressed={on} disabled={busy} onClick={() => toggle(pl)}>
                        <span>{pl.nome}</span>
                        {on && <FiCheck size={16} aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
                {playlists.length === 0 && <li className="sub">Você ainda não tem playlists.</li>}
              </ul>
            )}
            <form className="nova" onSubmit={criar}>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nova playlist"
                aria-label="Nome da nova playlist"
                maxLength={80}
              />
              <button type="submit" disabled={busy || !novoNome.trim()}>
                <FiPlus size={16} aria-hidden="true" /> Criar
              </button>
            </form>
            <button type="button" className="fechar" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </Sheet>
        </div>,
        document.body,
      )}
    </>
  );
}
