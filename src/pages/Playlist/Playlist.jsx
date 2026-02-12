import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../../components/Input/Input";
import {
  Page,
  Title,
  CardsGrid,
  Card,
  CifrasGrid,
  ModalBox,
  ModalDelete,
  IconButton,
  ShareInputRow,
  ShareList,
  SuggestList,
} from "./PlaylistStyled";

import {
  getPlaylistsService,
  createPlaylistService,
  editPlaylistService,
  deletePlaylistService,
  getPlaylistViewService,
  getPlaylistByIdService,
  sharePlaylistService,
  unsharePlaylistService,
} from "../../service/playlistService";
import { getCifrasService } from "../../service/cifraService";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import toast from "react-hot-toast";
import MultSeletor from "../../components/MultSeletor/MultSeletor";
import { getUsersService, searchUsersService } from "../../service/userService";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [cifras, setCifras] = useState([]);

  const [isCreating, setIsCreating] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [chosenCifras, setChosenCifras] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [sharedExistingEmails, setSharedExistingEmails] = useState([]);
  const [shareEmails, setShareEmails] = useState([]);
  const [shareInput, setShareInput] = useState("");
  const [shareSuggestions, setShareSuggestions] = useState([]);
  const [createShareEmails, setCreateShareEmails] = useState([]);
  const [createShareInput, setCreateShareInput] = useState("");
  const [createShareSuggestions, setCreateShareSuggestions] = useState([]);
  const shareSearchTimer = useRef(null);
  const createSearchTimer = useRef(null);

  const navigate = useNavigate();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const objectIdPattern = /^[a-f\d]{24}$/i;
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);
  const currentUserId = currentUser?._id || currentUser?.id || null;
  const currentUserEmail = currentUser?.email?.toLowerCase() || "";

  /* ======================
     MAP DE CIFRAS (opcional)
  ====================== */
  const cifrasById = useMemo(() => {
    const m = new Map();
    cifras.forEach((c) => m.set(c._id, c));
    return m;
  }, [cifras]);

  /* ======================
     HANDLERS
  ====================== */

  const updateCifra = useCallback((items) => {
    setChosenCifras(items);
  }, []);

  const parseEmails = useCallback((raw) => {
    return raw
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const addEmailsToList = useCallback(
    (raw, current, setCurrent, blocked = []) => {
      const emails = parseEmails(raw);
      if (emails.length === 0) return;

      const selfEmail = currentUserEmail;
      const hasSelf = selfEmail && emails.includes(selfEmail);
      const filteredEmails = hasSelf
        ? emails.filter((email) => email !== selfEmail)
        : emails;

      if (hasSelf) {
        toast.error("Voce não pode compartilhar consigo mesmo.");
      }

      const invalid = filteredEmails.filter(
        (email) => !emailPattern.test(email),
      );
      if (invalid.length > 0) {
        toast.error(`Email(s) inválido(s): ${invalid.join(", ")}`);
        return;
      }

      const next = [...current];
      filteredEmails.forEach((email) => {
        if (blocked.includes(email)) return;
        if (!next.includes(email)) next.push(email);
      });

      setCurrent(next);
    },
    [currentUserEmail, emailPattern, parseEmails],
  );

  const buildSuggestionList = useCallback(
    (data, blocked) => {
      const emails = (Array.isArray(data) ? data : [])
        .map((item) => item?.email)
        .filter(Boolean)
        .map((email) => email.toLowerCase());

      return emails.filter(
        (email) =>
          email !== currentUserEmail &&
          !blocked.includes(email) &&
          emailPattern.test(email),
      );
    },
    [currentUserEmail, emailPattern],
  );

  const fetchSuggestions = useCallback(
    async (query, blocked, setSuggestions) => {
      try {
        const response = await searchUsersService(query);
        const list = buildSuggestionList(response?.data, blocked);
        setSuggestions(list.slice(0, 6));
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    },
    [buildSuggestionList],
  );

  const removeEmailFromList = useCallback((email, setCurrent) => {
    setCurrent((prev) => prev.filter((item) => item !== email));
  }, []);

  const closeAllModals = useCallback(() => {
    setIsCreating(false);
    setModalEdit(false);
    setModalDelete(false);
    setShareModalOpen(false);
  }, []);

  const getOwnerId = useCallback((playlist) => {
    return (
      playlist?.ownerId ||
      playlist?.userId ||
      playlist?.usuarioId ||
      playlist?.criadoPorId ||
      playlist?.createdById ||
      playlist?.owner?._id ||
      playlist?.user?._id ||
      playlist?.usuario?._id ||
      playlist?.criadoPor?._id ||
      playlist?.createdBy?._id ||
      playlist?.createdBy ||
      null
    );
  }, []);

  const getSharedList = useCallback((playlist) => {
    return (
      playlist?.sharedWithEmails ||
      playlist?.sharedWith ||
      playlist?.sharedWithUsers ||
      playlist?.sharedUsers ||
      playlist?.compartilhadoCom ||
      []
    );
  }, []);

  const extractSharedEmails = useCallback(
    (playlist) => {
      const list = getSharedList(playlist);
      if (!Array.isArray(list)) return [];

      const emails = list
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") return item;
          return item.email || item.mail || null;
        })
        .filter(Boolean)
        .map((email) => email.toLowerCase());

      return Array.from(new Set(emails));
    },
    [getSharedList],
  );

  const resolveSharedEmails = useCallback(
    async (playlist) => {
      const list = getSharedList(playlist);
      if (!Array.isArray(list) || list.length === 0) return [];

      const rawValues = list.map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        return item.email || item.mail || item._id || item.id || null;
      });

      const normalized = rawValues.filter(Boolean).map((value) => value);
      const hasIds = normalized.some(
        (value) => typeof value === "string" && objectIdPattern.test(value),
      );

      if (!hasIds) {
        return extractSharedEmails({ sharedWith: normalized });
      }

      try {
        const usersResponse = await getUsersService();
        const users = Array.isArray(usersResponse?.data)
          ? usersResponse.data
          : [];
        const userById = new Map(
          users.map((user) => [user._id || user.id, user.email]),
        );

        const emails = normalized.map((value) => {
          if (typeof value !== "string") return null;
          if (emailPattern.test(value)) return value.toLowerCase();
          if (objectIdPattern.test(value)) return userById.get(value) || value;
          return value;
        });

        return Array.from(new Set(emails.filter(Boolean)));
      } catch (err) {
        console.error(err);
        return extractSharedEmails({ sharedWith: normalized });
      }
    },
    [emailPattern, extractSharedEmails, getSharedList, objectIdPattern],
  );

  const isSharedWithUser = useCallback(
    (playlist) => {
      const list = getSharedList(playlist);
      if (!Array.isArray(list) || list.length === 0) return false;

      return list.some((item) => {
        if (!item) return false;

        if (typeof item === "string") {
          return currentUserEmail && item.toLowerCase() === currentUserEmail;
        }

        const itemId = item._id || item.id || item.userId || item.usuarioId;
        const itemEmail = item.email || item.mail;

        if (currentUserId && itemId && itemId === currentUserId) return true;
        if (currentUserEmail && itemEmail) {
          return itemEmail.toLowerCase() === currentUserEmail;
        }

        return false;
      });
    },
    [currentUserEmail, currentUserId, getSharedList],
  );

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await getPlaylistsService();
      setPlaylists(res.data || []);
    } catch {
      toast.error("Falha ao carregar playlists.");
    }
  }, []);

  const fetchCifras = useCallback(async () => {
    try {
      const res = await getCifrasService();
      setCifras(res.data || []);
    } catch {
      toast.error("Falha ao carregar cifras.");
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
    fetchCifras();
  }, [fetchPlaylists, fetchCifras]);

  useEffect(() => {
    if (!shareModalOpen) return;
    const query = shareInput.trim();
    if (shareSearchTimer.current) clearTimeout(shareSearchTimer.current);

    if (query.length < 2) {
      setShareSuggestions([]);
      return;
    }

    shareSearchTimer.current = setTimeout(() => {
      const blocked = [...sharedExistingEmails, ...shareEmails];
      fetchSuggestions(query, blocked, setShareSuggestions);
    }, 250);

    return () => {
      if (shareSearchTimer.current) clearTimeout(shareSearchTimer.current);
    };
  }, [
    shareInput,
    shareModalOpen,
    shareEmails,
    sharedExistingEmails,
    fetchSuggestions,
  ]);

  useEffect(() => {
    if (!isCreating) return;
    const query = createShareInput.trim();
    if (createSearchTimer.current) clearTimeout(createSearchTimer.current);

    if (query.length < 2) {
      setCreateShareSuggestions([]);
      return;
    }

    createSearchTimer.current = setTimeout(() => {
      const blocked = [...createShareEmails];
      fetchSuggestions(query, blocked, setCreateShareSuggestions);
    }, 250);

    return () => {
      if (createSearchTimer.current) clearTimeout(createSearchTimer.current);
    };
  }, [createShareInput, createShareEmails, isCreating, fetchSuggestions]);

  async function handleClickEdit(item) {
    closeAllModals();
    setShareTarget(null);
    setShareEmails([]);
    setShareInput("");
    setSharedExistingEmails([]);

    const response = await getPlaylistViewService(item._id);
    setChosen(item);
    setChosenCifras(response.musicas || []);
    setModalEdit(true);
  }

  /* ======================
     CREATE
  ====================== */

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();

      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      if (!data.nome?.trim()) {
        toast.error("Informe o nome da playlist.");
        return;
      }

      data.cifras = chosenCifras.map((c) => c._id);

      if (createShareEmails.length > 0) {
        data.sharedWithEmails = createShareEmails;
      }

      try {
        await createPlaylistService(data);
        toast.success("Playlist criada com sucesso!");
        e.target.reset();
        setChosenCifras([]);
        setCreateShareEmails([]);
        setCreateShareInput("");
        setIsCreating(false);
        await fetchPlaylists();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao criar playlist.");
      }
    },
    [chosenCifras, createShareEmails, fetchPlaylists],
  );

  /* ======================
     EDIT
  ====================== */

  const handleEdit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!chosen?._id) return;

      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      if (!data.nome?.trim()) {
        toast.error("Informe o nome da playlist.");
        return;
      }

      data.cifras = chosenCifras.map((c) => c._id || c.id);

      try {
        await editPlaylistService(chosen._id, data);
        toast.success("Playlist editada com sucesso!");
        setModalEdit(false);
        setChosen(null);
        setChosenCifras([]);
        await fetchPlaylists();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao editar playlist.");
      }
    },
    [chosen, chosenCifras, fetchPlaylists],
  );

  const handleDelete = useCallback(async () => {
    if (!chosen?._id) return;

    const ownerId = getOwnerId(chosen);
    const isOwner = ownerId ? ownerId === currentUserId : false;
    const isAdm = currentUser?.level === "ADM";
    if (!isOwner && !isAdm) {
      toast.error("Somente o criador ou ADM pode excluir a playlist.");
      setModalDelete(false);
      setChosen(null);
      return;
    }

    try {
      await deletePlaylistService(chosen._id);
      toast.success("Playlist excluída com sucesso!");
      setModalDelete(false);
      setChosen(null);
      await fetchPlaylists();
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao excluir playlist";

      toast.error(message);

      toast.error("Falha ao excluir playlist.");
    }
  }, [chosen, currentUser?.level, currentUserId, fetchPlaylists, getOwnerId]);

  const handleOpenShare = useCallback(
    async (playlist) => {
      closeAllModals();
      setChosen(null);
      setChosenCifras([]);
      setShareTarget(playlist);
      setShareEmails([]);
      setShareInput("");
      setShareSuggestions([]);
      setSharedExistingEmails([]);
      setShareModalOpen(true);

      try {
        const detail = await getPlaylistByIdService(playlist._id);
        const emails = await resolveSharedEmails(detail);
        setSharedExistingEmails(emails);
      } catch (err) {
        console.error(err);
        toast.error("Não foi possivel carregar os compartilhamentos.");
      }
    },
    [closeAllModals, resolveSharedEmails],
  );

  const handleOpenCreate = useCallback(() => {
    closeAllModals();
    setChosen(null);
    setChosenCifras([]);
    setShareTarget(null);
    setShareEmails([]);
    setShareInput("");
    setShareSuggestions([]);
    setSharedExistingEmails([]);
    setCreateShareEmails([]);
    setCreateShareInput("");
    setCreateShareSuggestions([]);
    setIsCreating(true);
  }, [closeAllModals]);

  const handleOpenDelete = useCallback(
    (playlist) => {
      closeAllModals();
      setShareTarget(null);
      setShareEmails([]);
      setShareInput("");
      setSharedExistingEmails([]);
      setChosen(playlist);
      setModalDelete(true);
    },
    [closeAllModals],
  );

  const handleShareSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!shareTarget?._id) return;

      if (shareEmails.length === 0) {
        toast.error("Adicione ao menos um email novo para compartilhar.");
        return;
      }

      try {
        await sharePlaylistService(shareTarget._id, {
          emails: shareEmails,
        });
        toast.success("Playlist compartilhada com sucesso!");
        setShareModalOpen(false);
        setShareTarget(null);
        setSharedExistingEmails([]);
        setShareEmails([]);
        setShareInput("");
        setShareSuggestions([]);
        await fetchPlaylists();
      } catch (err) {
        const message =
          err.response?.data?.message || "Falha ao compartilhar playlist.";
        toast.error(message);
      }
    },
    [fetchPlaylists, shareEmails, shareTarget],
  );

  const handleUnshare = useCallback(
    async (email) => {
      if (!shareTarget?._id) return;
      if (!email) return;

      try {
        await unsharePlaylistService(shareTarget._id, { emails: [email] });
        setSharedExistingEmails((prev) =>
          prev.filter((item) => item !== email),
        );
        toast.success("Compartilhamento removido.");
      } catch (err) {
        const message =
          err.response?.data?.message || "Falha ao remover compartilhamento.";
        toast.error(message);
      }
    },
    [shareTarget],
  );

  return (
    <Page>
      <UsersHeader>
        <button onClick={() => navigate(-1)}>
          <img src="/back.svg" alt="Voltar" className="img-hover" />
        </button>
        <Title>Minhas Playlists</Title>
        <button className="btn" onClick={handleOpenCreate}>
          Criar Nova Playlist
        </button>
      </UsersHeader>

      <CardsGrid>
        {[...playlists]
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((pl) => (
            <Card key={pl._id}>
              <h3>{pl.nome}</h3>
              <div className="count">{pl.cifras?.length || 0} música(s)</div>
              {(() => {
                const ownerId = getOwnerId(pl);
                const shared = isSharedWithUser(pl);
                const isOwner = ownerId ? ownerId === currentUserId : !shared;
                const isAdm = currentUser?.level === "ADM";
                const canShare = isOwner || isAdm;

                return (
                  canShare && (
                    <IconButton
                      type="button"
                      className="share-corner"
                      onClick={() => handleOpenShare(pl)}
                      aria-label="Compartilhar"
                      title="Compartilhar"
                    >
                      <img src="/share.svg" alt="Compartilhar" />
                    </IconButton>
                  )
                );
              })()}
              <div className="actions">
                <button
                  className="btn"
                  onClick={() => navigate(`/home/playlists/${pl._id}/ver`)}
                >
                  Ver Músicas
                </button>
                {(() => {
                  const ownerId = getOwnerId(pl);
                  const shared = isSharedWithUser(pl);
                  const isOwner = ownerId ? ownerId === currentUserId : !shared;
                  const isAdm = currentUser?.level === "ADM";
                  const canEdit = isOwner || isAdm || shared;
                  const canDelete = isOwner || isAdm;

                  return (
                    <>
                      {canEdit && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleClickEdit(pl)}
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleOpenDelete(pl)}
                        >
                          Excluir
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </Card>
          ))}
      </CardsGrid>

      {/* CREATE */}
      {isCreating && (
        <ModalBox onSubmit={handleCreate}>
          <h3>Criar Playlist</h3>

          <div>
            <label>Nome da Playlist</label>
            <Input name="nome" required />
          </div>

          <div>
            <label>Músicas</label>
            <MultSeletor
              tipo="cifra"
              escolhidos={chosenCifras}
              addItem={updateCifra}
            />
          </div>

          <div>
            <label>Compartilhar com (emails)</label>
            <ShareInputRow>
              <Input
                type="text"
                placeholder="email@exemplo.com"
                value={createShareInput}
                onChange={(e) => setCreateShareInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmailsToList(
                      createShareInput,
                      createShareEmails,
                      setCreateShareEmails,
                    );
                    setCreateShareInput("");
                    setCreateShareSuggestions([]);
                  }
                }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  addEmailsToList(
                    createShareInput,
                    createShareEmails,
                    setCreateShareEmails,
                  );
                  setCreateShareInput("");
                  setCreateShareSuggestions([]);
                }}
              >
                Adicionar
              </button>
            </ShareInputRow>

            {createShareSuggestions.length > 0 && (
              <SuggestList>
                {createShareSuggestions.map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      addEmailsToList(
                        email,
                        createShareEmails,
                        setCreateShareEmails,
                      );
                      setCreateShareInput("");
                      setCreateShareSuggestions([]);
                    }}
                  >
                    {email}
                  </button>
                ))}
              </SuggestList>
            )}

            {createShareEmails.length > 0 && (
              <ShareList>
                {createShareEmails.map((email) => (
                  <div key={email} className="chip">
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() =>
                        removeEmailFromList(email, setCreateShareEmails)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </ShareList>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setIsCreating(false);
                setChosenCifras([]);
                setCreateShareEmails([]);
                setCreateShareInput("");
                setCreateShareSuggestions([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* EDIT */}
      {modalEdit && chosen && (
        <ModalBox onSubmit={handleEdit}>
          <h3>Editar Playlist</h3>

          <div>
            <label>Nome da Playlist</label>
            <Input name="nome" defaultValue={chosen.nome} required />
          </div>

          <div>
            <label>Músicas</label>
            <CifrasGrid>
              <MultSeletor
                tipo="cifra"
                escolhidos={chosenCifras}
                addItem={updateCifra}
              />
            </CifrasGrid>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setModalEdit(false);
                setChosenCifras([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* SHARE */}
      {shareModalOpen && shareTarget && (
        <ModalBox onSubmit={handleShareSubmit}>
          <h3>Compartilhar “{shareTarget.nome}”</h3>

          <div>
            <label>Emails</label>
            <ShareInputRow>
              <Input
                type="text"
                placeholder="email@exemplo.com"
                value={shareInput}
                onChange={(e) => setShareInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmailsToList(shareInput, shareEmails, setShareEmails);
                    setShareInput("");
                    setShareSuggestions([]);
                  }
                }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  addEmailsToList(
                    shareInput,
                    shareEmails,
                    setShareEmails,
                    sharedExistingEmails,
                  );
                  setShareInput("");
                  setShareSuggestions([]);
                }}
              >
                Adicionar
              </button>
            </ShareInputRow>

            {shareSuggestions.length > 0 && (
              <SuggestList>
                {shareSuggestions.map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      addEmailsToList(
                        email,
                        shareEmails,
                        setShareEmails,
                        sharedExistingEmails,
                      );
                      setShareInput("");
                      setShareSuggestions([]);
                    }}
                  >
                    {email}
                  </button>
                ))}
              </SuggestList>
            )}

            {sharedExistingEmails.length > 0 && (
              <ShareList>
                {sharedExistingEmails.map((email) => (
                  <div key={email} className="chip">
                    <span>{email}</span>
                    {(() => {
                      const ownerId = getOwnerId(shareTarget);
                      const isOwner = ownerId
                        ? ownerId === currentUserId
                        : false;
                      const isAdm = currentUser?.level === "ADM";
                      const canRemove = isOwner || isAdm;

                      return (
                        canRemove && (
                          <button
                            type="button"
                            onClick={() => handleUnshare(email)}
                          >
                            ×
                          </button>
                        )
                      );
                    })()}
                  </div>
                ))}
              </ShareList>
            )}

            {shareEmails.length > 0 && (
              <ShareList>
                {shareEmails.map((email) => (
                  <div key={email} className="chip">
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmailFromList(email, setShareEmails)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </ShareList>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Compartilhar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setShareModalOpen(false);
                setShareTarget(null);
                setSharedExistingEmails([]);
                setShareEmails([]);
                setShareInput("");
                setShareSuggestions([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* DELETE */}
      {modalDelete && chosen && (
        <ModalDelete>
          <h3>Excluir “{chosen.nome}”?</h3>
          <div>
            <button onClick={handleDelete} className="btn btn-danger">
              Excluir
            </button>
            <button className="btn" onClick={() => setModalDelete(false)}>
              Cancelar
            </button>
          </div>
        </ModalDelete>
      )}
    </Page>
  );
}
