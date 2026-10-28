import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "../Input/Input";
import MultSeletor from "../MultSeletor/MultSeletor";
import RoteiroModelo from "../RoteiroModelo/RoteiroModelo";
import { useAuth } from "../../context/AuthContext";
import {
  deletePlaylistService,
  getPlaylistByIdService,
  getPlaylistViewService,
  sharePlaylistService,
  unsharePlaylistService,
} from "../../service/playlistService";
import { searchUsersService } from "../../service/userService";
import { getPlaylistOwnerId } from "../../utils/playlistAccess";
import { getPublicAppUrl } from "../../utils/getPublicAppUrl";
import { readPlaylistForm, submitCreatePlaylist, submitEditPlaylist } from "../../utils/playlistForm";
import {
  ModalBox,
  ModalDelete,
  ModalOverlay,
  ShareInputRow,
  ShareList,
  SuggestList,
} from "../../pages/Playlist/PlaylistStyled";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const parseEmails = (raw) =>
  raw
    .split(/[\s,;]+/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

/**
 * Lista de e-mails em "chips" com campo de digitação e sugestões (só para ADM,
 * pois GET /user/search exige admin). `blocked` são e-mails que não podem entrar
 * (ex.: quem já recebeu a playlist).
 */
function useEmailChips(active, blocked = []) {
  const { user, isAdmin } = useAuth();
  const selfEmail = user?.email?.toLowerCase() || "";
  const [emails, setEmails] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const blockedKey = blocked.join("|");

  useEffect(() => {
    const q = input.trim();
    if (!active || !isAdmin || q.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsersService(q);
        if (cancelled) return;
        const list = (Array.isArray(res?.data) ? res.data : [])
          .map((i) => i?.email?.toLowerCase())
          .filter(Boolean)
          .filter(
            (e) =>
              e !== selfEmail &&
              !blockedKey.split("|").includes(e) &&
              !emails.includes(e) &&
              EMAIL_PATTERN.test(e),
          );
        setSuggestions(list.slice(0, 6));
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, input, isAdmin, selfEmail, blockedKey, emails]);

  const add = useCallback(
    (raw) => {
      const parsed = parseEmails(raw);
      setInput("");
      setSuggestions([]);
      if (!parsed.length) return;

      const hasSelf = selfEmail && parsed.includes(selfEmail);
      if (hasSelf) toast.error("Você não pode compartilhar consigo mesmo.");
      const candidates = hasSelf ? parsed.filter((e) => e !== selfEmail) : parsed;
      const invalid = candidates.filter((e) => !EMAIL_PATTERN.test(e));
      if (invalid.length) {
        toast.error(`Email(s) inválido(s): ${invalid.join(", ")}`);
        return;
      }
      setEmails((prev) => {
        const next = [...prev];
        candidates.forEach((e) => {
          if (!blockedKey.split("|").includes(e) && !next.includes(e)) next.push(e);
        });
        return next;
      });
    },
    [blockedKey, selfEmail],
  );

  const remove = useCallback((email) => setEmails((prev) => prev.filter((e) => e !== email)), []);
  const reset = useCallback(() => {
    setEmails([]);
    setInput("");
    setSuggestions([]);
  }, []);

  return { emails, input, setInput, suggestions, add, remove, reset };
}

function EmailChipsField({ label, chips }) {
  return (
    <div>
      <label>{label}</label>
      <ShareInputRow>
        <Input
          type="text"
          placeholder="email@exemplo.com"
          value={chips.input}
          onChange={(e) => chips.setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              chips.add(chips.input);
            }
          }}
        />
        <button type="button" className="btn" onClick={() => chips.add(chips.input)}>
          Adicionar
        </button>
      </ShareInputRow>
      {chips.suggestions.length > 0 && (
        <SuggestList>
          {chips.suggestions.map((email) => (
            <button key={email} type="button" onClick={() => chips.add(email)}>
              {email}
            </button>
          ))}
        </SuggestList>
      )}
      {chips.emails.length > 0 && (
        <ShareList>
          {chips.emails.map((email) => (
            <div key={email} className="chip">
              <span>{email}</span>
              <button type="button" aria-label={`Remover ${email}`} onClick={() => chips.remove(email)}>
                ×
              </button>
            </div>
          ))}
        </ShareList>
      )}
    </div>
  );
}

/**
 * Criar, editar, compartilhar e excluir playlist: toda a lógica e os modais num
 * lugar só (antes estavam copiados em Home e Playlist).
 *
 * const manager = usePlaylistManager({ onChanged: refetch });
 * manager.openCreate() | openEdit(pl) | openShare(pl) | openDelete(pl)
 * ...e renderize {manager.modals} uma vez na página.
 */
export function usePlaylistManager({ onChanged } = {}) {
  const { user, isAdmin } = useAuth();
  const currentUserId = user?._id || user?.id || null;

  // { type: "create" | "edit" | "share" | "delete", playlist? }
  const [dialog, setDialog] = useState(null);
  const [chosenCifras, setChosenCifras] = useState([]);
  const [existingShared, setExistingShared] = useState([]);
  const [busy, setBusy] = useState(false);

  const type = dialog?.type;
  const playlist = dialog?.playlist;

  const createChips = useEmailChips(type === "create");
  const shareChips = useEmailChips(type === "share", existingShared);

  const close = useCallback(() => {
    setDialog(null);
    setChosenCifras([]);
    setExistingShared([]);
    createChips.reset();
    shareChips.reset();
  }, [createChips, shareChips]);

  const done = useCallback(
    async (message) => {
      toast.success(message);
      close();
      await onChanged?.();
    },
    [close, onChanged],
  );

  const openCreate = useCallback(() => {
    close();
    setDialog({ type: "create" });
  }, [close]);

  const openEdit = useCallback(
    async (pl) => {
      close();
      try {
        const view = await getPlaylistViewService(pl._id);
        setChosenCifras(view.musicas || []);
        setDialog({ type: "edit", playlist: pl });
      } catch {
        toast.error("Não foi possível abrir a playlist para edição.");
      }
    },
    [close],
  );

  const openShare = useCallback(
    async (pl) => {
      close();
      setDialog({ type: "share", playlist: pl });
      try {
        const detail = await getPlaylistByIdService(pl._id);
        setExistingShared(detail.sharedEmails || []);
      } catch {
        setExistingShared([]);
      }
    },
    [close],
  );

  const openDelete = useCallback(
    (pl) => {
      close();
      setDialog({ type: "delete", playlist: pl });
    },
    [close],
  );

  async function submitCreate(e) {
    e.preventDefault();
    const { error, data, bannerFile } = readPlaylistForm(
      e.target,
      chosenCifras.map((c) => c._id || c.id),
    );
    if (error) return toast.error(error);

    const appUrl = getPublicAppUrl();
    if (appUrl) {
      data.appUrl = appUrl;
      data.frontendUrl = appUrl;
    }
    if (createChips.emails.length) data.sharedWithEmails = createChips.emails;

    setBusy(true);
    try {
      await submitCreatePlaylist(data, bannerFile);
      await done("Playlist criada!");
    } catch {
      toast.error("Falha ao criar playlist.");
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!playlist?._id) return;
    const { error, data, bannerFile } = readPlaylistForm(
      e.target,
      chosenCifras.map((c) => c._id || c.id),
    );
    if (error) return toast.error(error);

    setBusy(true);
    try {
      await submitEditPlaylist(playlist._id, data, bannerFile);
      await done("Playlist editada!");
    } catch {
      toast.error("Falha ao editar playlist.");
    } finally {
      setBusy(false);
    }
  }

  async function submitShare(e) {
    e.preventDefault();
    if (!playlist?._id) return;
    if (!shareChips.emails.length) return toast.error("Adicione ao menos um email.");

    const appUrl = getPublicAppUrl();
    const viewUrl = appUrl ? `${appUrl}/home/playlists/${playlist._id}/ver` : undefined;
    setBusy(true);
    try {
      await sharePlaylistService(playlist._id, {
        emails: shareChips.emails,
        appUrl,
        frontendUrl: appUrl,
        playlistUrl: viewUrl,
        playlistViewUrl: viewUrl,
      });
      await done("Playlist compartilhada!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Falha ao compartilhar.");
    } finally {
      setBusy(false);
    }
  }

  async function unshare(email) {
    if (!playlist?._id || !email) return;
    try {
      await unsharePlaylistService(playlist._id, { emails: [email] });
      setExistingShared((prev) => prev.filter((e) => e !== email));
      toast.success("Compartilhamento removido.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Falha ao remover compartilhamento.");
    }
  }

  async function confirmDelete() {
    if (!playlist?._id || busy) return;
    setBusy(true);
    try {
      await deletePlaylistService(playlist._id);
      await done("Playlist excluída!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao excluir playlist.");
    } finally {
      setBusy(false);
    }
  }

  const cancel = (
    <button type="button" className="btn btn-danger" onClick={close}>
      Cancelar
    </button>
  );

  const element = (
    <>
      {type && <ModalOverlay onClick={close} />}

      {type === "create" && (
        <ModalBox onSubmit={submitCreate}>
          <h3>Criar Playlist</h3>
          <div>
            <label htmlFor="pm-nome">Nome da Playlist</label>
            <Input id="pm-nome" name="nome" required placeholder="Nome da Playlist" />
          </div>
          <div>
            <label htmlFor="pm-data">Data do evento (opcional)</label>
            <Input id="pm-data" name="dataEvento" type="date" />
          </div>
          <div>
            <label htmlFor="pm-banner">Capa da playlist (opcional)</label>
            <input id="pm-banner" name="banner" type="file" accept="image/*" />
          </div>
          <RoteiroModelo escolhidos={chosenCifras} addItem={setChosenCifras} nomeInputId="pm-nome" />
          <div>
            <MultSeletor className="playlist-mult" tipo="cifra" escolhidos={chosenCifras} addItem={setChosenCifras} allowReorder />
          </div>
          <EmailChipsField label="Compartilhar com (emails)" chips={createChips} />
          <div className="modal-actions">
            {cancel}
            <button type="submit" className="btn" disabled={busy}>
              Salvar
            </button>
          </div>
        </ModalBox>
      )}

      {type === "edit" && playlist && (
        <ModalBox onSubmit={submitEdit}>
          <h3>Editar Playlist</h3>
          <div>
            <label htmlFor="pm-nome">Nome da Playlist</label>
            <Input id="pm-nome" name="nome" defaultValue={playlist.nome} required />
          </div>
          <div>
            <label htmlFor="pm-data">Data do evento (opcional)</label>
            <Input
              id="pm-data"
              name="dataEvento"
              type="date"
              defaultValue={playlist.dataEvento ? String(playlist.dataEvento).slice(0, 10) : ""}
            />
          </div>
          <div>
            <label htmlFor="pm-banner">Capa da playlist (opcional)</label>
            <input id="pm-banner" name="banner" type="file" accept="image/*" />
          </div>
          <div>
            <label>Músicas</label>
            <MultSeletor className="playlist-mult" tipo="cifra" escolhidos={chosenCifras} addItem={setChosenCifras} allowReorder />
          </div>
          <div className="modal-actions">
            {cancel}
            <button type="submit" className="btn" disabled={busy}>
              Salvar
            </button>
          </div>
        </ModalBox>
      )}

      {type === "share" && playlist && (
        <ModalBox onSubmit={submitShare}>
          <h3>Compartilhar “{playlist.nome}”</h3>
          <EmailChipsField label="Emails" chips={shareChips} />
          {existingShared.length > 0 && (
            <div>
              <label>Já compartilhada com</label>
              <ShareList>
                {existingShared.map((value) => {
                  const isDeletedUser = OBJECT_ID_PATTERN.test(value);
                  const ownerId = getPlaylistOwnerId(playlist);
                  const canRemove = (ownerId && ownerId === currentUserId) || isAdmin;
                  // quem não é dono/ADM não vê nem remove entradas de usuários excluídos
                  if (isDeletedUser && !canRemove) return null;
                  return (
                    <div key={value} className={`chip${isDeletedUser ? " chip-deleted" : ""}`}>
                      <span>{isDeletedUser ? "Usuário excluído" : value}</span>
                      {canRemove && (
                        <button
                          type="button"
                          aria-label={`Remover ${isDeletedUser ? "usuário excluído" : value}`}
                          onClick={() => unshare(value)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </ShareList>
            </div>
          )}
          <div className="modal-actions">
            {cancel}
            <button type="submit" className="btn" disabled={busy}>
              Compartilhar
            </button>
          </div>
        </ModalBox>
      )}

      {type === "delete" && playlist && (
        <ModalDelete>
          <h3>Excluir “{playlist.nome}”?</h3>
          <p>Essa ação é irreversível e removerá a playlist permanentemente.</p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={close}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={busy}>
              {busy ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </ModalDelete>
      )}
    </>
  );

  return { openCreate, openEdit, openShare, openDelete, modals: element };
}
