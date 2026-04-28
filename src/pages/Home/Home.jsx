import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Cifras
import { getCifrasService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
import { getFavoritosService, toggleFavoritoService } from "../../service/favoritosService";
import { useSearch } from "../../hooks/useSearch";

// Playlists
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
import { getMeRequest } from "../../service/auth.service";
import { getUsersService, searchUsersService } from "../../service/userService";
import { getPublicAppUrl } from "../../utils/getPublicAppUrl";
import MultSeletor from "../../components/MultSeletor/MultSeletor";
import { Input } from "../../components/Input/Input";
import {
  ModalBox,
  ModalDelete as PlaylistModalDelete,
  ShareInputRow,
  ShareList,
  SuggestList,
} from "../Playlist/PlaylistStyled";
import toast from "react-hot-toast";

import BorderGlow from "../../components/BorderGlow/BorderGlow";
import {
  HomeWrapper,
  Panel,
  PanelHeader,
  PanelTitle,
  CreatePlaylistBtn,
  PlaylistCardsGrid,
  PlaylistCard,
  PlaylistEmpty,
  FiltersContainer,
  FilterInput,
  FilterDropdownWrapper,
  FilterDropdownTrigger,
  FilterDropdownPanel,
  FilterDropdownItem,
  FavBtn,
  CifraList,
  CifraItem,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
} from "./HomeStyled";

/* ── helpers ─────────────────────────────────────── */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const sortByNome = (a, b) =>
  (a?.nome || "").localeCompare(b?.nome || "", "pt-BR", { sensitivity: "base" });

export default function Home() {
  const navigate = useNavigate();

  /* ── Estado: cifras ─────────────────────────────── */
  const [cifras, setCifras] = useState([]);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const { search: searchNome, setSearch: setSearchNome, debounced } = useSearch();
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(new Set());
  const filterRef = useRef(null);
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [favoritosMode, setFavoritosMode] = useState(false);
  const favoritosSet = useMemo(() => new Set(favoritosIds), [favoritosIds]);

  /* ── Estado: playlists ──────────────────────────── */
  const [playlists, setPlaylists] = useState([]);
  const [playlistPage, setPlaylistPage] = useState(0);
  const PLAYLISTS_PER_PAGE = 6;
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const shareSearchTimer = useRef(null);
  const createSearchTimer = useRef(null);
  const currentUserId = authenticatedUser?._id || authenticatedUser?.id || null;
  const currentUserEmail = authenticatedUser?.email?.toLowerCase() || "";

  /* ── Computed: playlists paginadas ─────────────── */
  const sortedPlaylists = useMemo(() => [...playlists].sort(sortByNome), [playlists]);
  const totalPlaylistPages = Math.ceil(sortedPlaylists.length / PLAYLISTS_PER_PAGE);
  const visiblePlaylists = useMemo(
    () => sortedPlaylists.slice(playlistPage * PLAYLISTS_PER_PAGE, (playlistPage + 1) * PLAYLISTS_PER_PAGE),
    [sortedPlaylists, playlistPage]
  );

  /* ── Computed: categorias ───────────────────────── */
  const rootCategorias = useMemo(
    () => categorias.filter((c) => !c.parent).sort(sortByNome),
    [categorias]
  );
  const relevantCategoriaIds = useMemo(() => {
    if (!categoriaFiltro) return [];
    const ids = [categoriaFiltro];
    categorias.forEach((cat) => {
      const parentId = cat.parent?._id || cat.parent;
      if (String(parentId) === categoriaFiltro) ids.push(cat._id);
    });
    return ids;
  }, [categoriaFiltro, categorias]);

  const filterLabel = useMemo(() => {
    if (!categoriaFiltro) return "Todas as categorias";
    const cat = categorias.find((c) => c._id === categoriaFiltro);
    if (!cat) return "Todas as categorias";
    const hasChildren = categorias.some(
      (c) => String(c.parent?._id || c.parent) === String(cat._id)
    );
    if (hasChildren) return `${cat.nome} (todas)`;
    return cat.nome;
  }, [categoriaFiltro, categorias]);

  /* ── Efeitos iniciais ───────────────────────────── */
  useEffect(() => {
    getCategoriasService().then((r) => setCategorias(r.data || [])).catch(() => {});
    getFavoritosService().then(setFavoritosIds).catch(() => {});
    fetchPlaylists();
    getMeRequest()
      .then((u) => {
        setAuthenticatedUser(u);
        setIsAdmin(String(u?.level || "").toUpperCase() === "ADM");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Fetch cifras ───────────────────────────────── */
  const fetchCifras = useCallback(async () => {
    if (favoritosMode && favoritosIds.length === 0) {
      setCifras([]); setPages(0); return;
    }
    try {
      const res = await getCifrasService({
        nome: debounced || undefined,
        categorias: relevantCategoriaIds.length ? relevantCategoriaIds : undefined,
        favoritos: favoritosMode ? favoritosIds : undefined,
        page: currentPage,
        limit: 6,
      });
      setCifras(res.data.cifras || []);
      setPages(res.data.pages || 0);
    } catch {}
  }, [debounced, relevantCategoriaIds, currentPage, favoritosMode, favoritosIds]);

  useEffect(() => { fetchCifras(); }, [fetchCifras]);
  useEffect(() => { setCurrentPage(0); }, [debounced, categoriaFiltro, favoritosMode]);

  /* ── Favoritos ──────────────────────────────────── */
  const handleToggleFavorito = useCallback(async (cifraId) => {
    try {
      const updated = await toggleFavoritoService(cifraId);
      setFavoritosIds(updated);
    } catch {}
  }, []);

  /* ── Fetch playlists ────────────────────────────── */
  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await getPlaylistsService();
      setPlaylists(res.data || []);
    } catch { toast.error("Falha ao carregar playlists."); }
  }, []);

  /* ── Helpers de playlist ────────────────────────── */
  const getOwnerId = useCallback((pl) =>
    pl?.criador?._id || pl?.criador || pl?.ownerId || pl?.userId || pl?.owner?._id || pl?.createdBy?._id || pl?.createdBy || null,
  []);

  const getSharedList = useCallback((pl) =>
    pl?.sharedWithEmails || pl?.sharedWith || pl?.sharedWithUsers || pl?.compartilhadoCom || [],
  []);

  const isSharedWithUser = useCallback((pl) => {
    const list = getSharedList(pl);
    if (!Array.isArray(list) || !list.length) return false;
    return list.some((item) => {
      if (!item) return false;
      if (typeof item === "string") return currentUserEmail && item.toLowerCase() === currentUserEmail;
      const itemId = item._id || item.id;
      const itemEmail = item.email || item.mail;
      if (currentUserId && itemId && itemId === currentUserId) return true;
      if (currentUserEmail && itemEmail) return itemEmail.toLowerCase() === currentUserEmail;
      return false;
    });
  }, [currentUserEmail, currentUserId, getSharedList]);

  const extractSharedEmails = useCallback((pl) => {
    const list = getSharedList(pl);
    if (!Array.isArray(list)) return [];
    return Array.from(new Set(
      list.map((i) => typeof i === "string" ? i : i?.email || i?.mail || null)
        .filter(Boolean).map((e) => e.toLowerCase())
    ));
  }, [getSharedList]);

  const resolveSharedEmails = useCallback(async (pl) => {
    const list = getSharedList(pl);
    if (!Array.isArray(list) || !list.length) return [];
    const raw = list.map((i) => typeof i === "string" ? i : i?.email || i?.mail || i?._id || i?.id || null).filter(Boolean);
    const hasIds = raw.some((v) => typeof v === "string" && OBJECT_ID_PATTERN.test(v));
    if (!hasIds) return extractSharedEmails({ sharedWith: raw });
    try {
      const users = (await getUsersService()).data || [];
      const byId = new Map(users.map((u) => [u._id || u.id, u.email]));
      return Array.from(new Set(raw.map((v) => {
        if (EMAIL_PATTERN.test(v)) return v.toLowerCase();
        if (OBJECT_ID_PATTERN.test(v)) return byId.get(v) || v;
        return v;
      }).filter(Boolean)));
    } catch { return extractSharedEmails({ sharedWith: raw }); }
  }, [extractSharedEmails, getSharedList]);

  const parseEmails = useCallback((raw) =>
    raw.split(/[\s,;]+/).map((v) => v.trim().toLowerCase()).filter(Boolean), []);

  const addEmailsToList = useCallback((raw, current, setCurrent, blocked = []) => {
    const emails = parseEmails(raw);
    if (!emails.length) return;
    const selfEmail = currentUserEmail;
    const hasSelf = selfEmail && emails.includes(selfEmail);
    const filtered = hasSelf ? emails.filter((e) => e !== selfEmail) : emails;
    if (hasSelf) toast.error("Você não pode compartilhar consigo mesmo.");
    const invalid = filtered.filter((e) => !EMAIL_PATTERN.test(e));
    if (invalid.length) { toast.error(`Email(s) inválido(s): ${invalid.join(", ")}`); return; }
    const next = [...current];
    filtered.forEach((e) => { if (!blocked.includes(e) && !next.includes(e)) next.push(e); });
    setCurrent(next);
  }, [currentUserEmail, parseEmails]);

  const removeEmail = useCallback((email, setter) => {
    setter((prev) => prev.filter((e) => e !== email));
  }, []);

  const buildSuggestions = useCallback((data, blocked) =>
    (Array.isArray(data) ? data : [])
      .map((i) => i?.email?.toLowerCase()).filter(Boolean)
      .filter((e) => e !== currentUserEmail && !blocked.includes(e) && EMAIL_PATTERN.test(e)),
  [currentUserEmail]);

  const fetchSuggestions = useCallback(async (query, blocked, setSuggestions) => {
    try {
      const res = await searchUsersService(query);
      setSuggestions(buildSuggestions(res?.data, blocked).slice(0, 6));
    } catch { setSuggestions([]); }
  }, [buildSuggestions]);

  const stripEmoji = useCallback((v) =>
    typeof v === "string" ? v.replace(/^[\s]*(?:🎵|🎶|♪|♫)\s*/u, "") : v || "", []);

  const closeAllModals = useCallback(() => {
    setIsCreating(false); setModalEdit(false);
    setModalDelete(false); setShareModalOpen(false);
  }, []);

  /* ── Share suggestions debounce ─────────────────── */
  useEffect(() => {
    if (!shareModalOpen) return;
    const q = shareInput.trim();
    clearTimeout(shareSearchTimer.current);
    if (q.length < 2) { setShareSuggestions([]); return; }
    shareSearchTimer.current = setTimeout(() => {
      fetchSuggestions(q, [...sharedExistingEmails, ...shareEmails], setShareSuggestions);
    }, 250);
    return () => clearTimeout(shareSearchTimer.current);
  }, [shareInput, shareModalOpen, shareEmails, sharedExistingEmails, fetchSuggestions]);

  useEffect(() => {
    if (!isCreating) return;
    const q = createShareInput.trim();
    clearTimeout(createSearchTimer.current);
    if (q.length < 2) { setCreateShareSuggestions([]); return; }
    createSearchTimer.current = setTimeout(() => {
      fetchSuggestions(q, createShareEmails, setCreateShareSuggestions);
    }, 250);
    return () => clearTimeout(createSearchTimer.current);
  }, [createShareInput, createShareEmails, isCreating, fetchSuggestions]);

  /* ── Handlers de playlist ───────────────────────── */
  const handleOpenCreate = useCallback(() => {
    closeAllModals(); setChosen(null); setChosenCifras([]);
    setCreateShareEmails([]); setCreateShareInput(""); setCreateShareSuggestions([]);
    setIsCreating(true);
  }, [closeAllModals]);

  async function handleClickEdit(pl) {
    closeAllModals();
    const res = await getPlaylistViewService(pl._id);
    setChosen(pl); setChosenCifras(res.musicas || []); setModalEdit(true);
  }

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.nome?.trim()) { toast.error("Informe o nome da playlist."); return; }
    data.cifras = chosenCifras.map((c) => c._id);
    const appUrl = getPublicAppUrl();
    if (appUrl) { data.appUrl = appUrl; data.frontendUrl = appUrl; }
    if (createShareEmails.length) data.sharedWithEmails = createShareEmails;
    try {
      await createPlaylistService(data);
      toast.success("Playlist criada!");
      e.target.reset(); setChosenCifras([]); setCreateShareEmails([]);
      setCreateShareInput(""); setIsCreating(false);
      fetchPlaylists();
    } catch { toast.error("Falha ao criar playlist."); }
  }, [chosenCifras, createShareEmails, fetchPlaylists]);

  const handleEdit = useCallback(async (e) => {
    e.preventDefault();
    if (!chosen?._id) return;
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.nome?.trim()) { toast.error("Informe o nome da playlist."); return; }
    data.cifras = chosenCifras.map((c) => c._id || c.id);
    try {
      await editPlaylistService(chosen._id, data);
      toast.success("Playlist editada!");
      setModalEdit(false); setChosen(null); setChosenCifras([]); fetchPlaylists();
    } catch { toast.error("Falha ao editar playlist."); }
  }, [chosen, chosenCifras, fetchPlaylists]);

  const handleDelete = useCallback(async () => {
    if (!chosen?._id || isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePlaylistService(chosen._id);
      toast.success("Playlist excluída!");
      setModalDelete(false); setChosen(null); fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao excluir playlist.");
    } finally { setIsDeleting(false); }
  }, [chosen, fetchPlaylists, isDeleting]);

  const handleOpenShare = useCallback(async (pl) => {
    closeAllModals(); setShareTarget(pl); setShareEmails([]);
    setShareInput(""); setShareSuggestions([]); setSharedExistingEmails([]);
    setShareModalOpen(true);
    try {
      const detail = await getPlaylistByIdService(pl._id);
      setSharedExistingEmails(await resolveSharedEmails(detail));
    } catch { toast.error("Não foi possível carregar compartilhamentos."); }
  }, [closeAllModals, resolveSharedEmails]);

  const handleShareSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!shareTarget?._id) return;
    if (!shareEmails.length) { toast.error("Adicione ao menos um email."); return; }
    try {
      const appUrl = getPublicAppUrl();
      const viewUrl = appUrl ? `${appUrl}/home/playlists/${shareTarget._id}/ver` : undefined;
      await sharePlaylistService(shareTarget._id, {
        emails: shareEmails, appUrl, frontendUrl: appUrl,
        playlistUrl: viewUrl, playlistViewUrl: viewUrl,
      });
      toast.success("Playlist compartilhada!");
      setShareModalOpen(false); setShareTarget(null);
      setSharedExistingEmails([]); setShareEmails([]); setShareInput("");
      fetchPlaylists();
    } catch (err) { toast.error(err.response?.data?.message || "Falha ao compartilhar."); }
  }, [fetchPlaylists, shareEmails, shareTarget]);

  const handleUnshare = useCallback(async (email) => {
    if (!shareTarget?._id) return;
    try {
      await unsharePlaylistService(shareTarget._id, { emails: [email] });
      setSharedExistingEmails((prev) => prev.filter((e) => e !== email));
      toast.success("Compartilhamento removido.");
    } catch { toast.error("Falha ao remover compartilhamento."); }
  }, [shareTarget]);

  /* ── Categorias helper ──────────────────────────── */
  const findCategoria = (cat) => {
    const id = typeof cat === "string" ? cat : cat?._id;
    return categorias.find((c) => c._id === id);
  };
  const getCatLabel = (cat) => {
    const c = findCategoria(cat);
    if (!c) return "";
    const parentId = typeof c.parent === "string" ? c.parent : c.parent?._id;
    const parent = categorias.find((x) => x._id === parentId);
    return parent ? `${c.nome} (${parent.nome})` : c.nome;
  };

  /* ── Render ─────────────────────────────────────── */
  return (
    <HomeWrapper>
      {/* ══ PAINEL ESQUERDO: PLAYLISTS ══ */}
      <BorderGlow borderRadius={16} colors={['#c084fc', '#818cf8', '#38bdf8']} glowColor="270 70 75">
      <Panel>
        <PanelHeader>
          <PanelTitle>Minhas Playlists</PanelTitle>
          <CreatePlaylistBtn type="button" onClick={handleOpenCreate}>
            + Criar Nova Playlist
          </CreatePlaylistBtn>
        </PanelHeader>

        {playlists.length === 0 ? (
          <PlaylistEmpty>
            <p>Você ainda não tem playlists.</p>
            <CreatePlaylistBtn type="button" onClick={handleOpenCreate}>
              Criar primeira playlist
            </CreatePlaylistBtn>
          </PlaylistEmpty>
        ) : (
          <PlaylistCardsGrid>
            {visiblePlaylists.map((pl) => {
              const ownerId = getOwnerId(pl);
              const shared = isSharedWithUser(pl);
              const isOwner = ownerId ? ownerId === currentUserId : !shared;
              const canShare = isOwner || isAdmin;
              const canEdit = isOwner || isAdmin || shared;
              const canDelete = isOwner || isAdmin;

              return (
                <PlaylistCard key={pl._id}>
                  <div className="card-head">
                    <img src="/music.svg" alt="" aria-hidden="true" />
                    <span>{stripEmoji(pl.nome)}</span>
                  </div>
                  <div className="card-body">
                    <span className="card-count">{pl.cifras?.length || 0} música(s)</span>
                    <button
                      className="ver-btn"
                      onClick={() => navigate(`/home/playlists/${pl._id}/ver`)}
                    >
                      <img src="/music.svg" alt="" aria-hidden="true" />
                      Ver Músicas
                    </button>
                  </div>
                  {(canShare || canEdit || canDelete) && (
                    <div className="card-actions-corner">
                      {canShare && (
                        <button className="card-icon-btn" aria-label="Compartilhar" onClick={() => handleOpenShare(pl)}>
                          <img src="/share.svg" alt="Compartilhar" />
                        </button>
                      )}
                      {canEdit && (
                        <button className="card-icon-btn" aria-label="Editar" onClick={() => handleClickEdit(pl)}>
                          <img src="/update.svg" alt="Editar" />
                        </button>
                      )}
                      {canDelete && (
                        <button className="card-icon-btn" aria-label="Excluir" onClick={() => { closeAllModals(); setChosen(pl); setModalDelete(true); }}>
                          <img src="/delete.svg" alt="Excluir" />
                        </button>
                      )}
                    </div>
                  )}
                </PlaylistCard>
              );
            })}
          </PlaylistCardsGrid>
        )}

        {totalPlaylistPages > 1 && (
          <PaginationContainer>
            <PaginationButton disabled={playlistPage === 0}
              onClick={() => setPlaylistPage((p) => p - 1)}>
              Anterior
            </PaginationButton>
            <PaginationInfo>
              {playlistPage + 1} / {totalPlaylistPages}
            </PaginationInfo>
            <PaginationButton disabled={playlistPage + 1 >= totalPlaylistPages}
              onClick={() => setPlaylistPage((p) => p + 1)}>
              Próxima
            </PaginationButton>
          </PaginationContainer>
        )}
      </Panel>
      </BorderGlow>

      {/* ══ PAINEL DIREITO: CIFRAS ══ */}
      <BorderGlow borderRadius={16} colors={['#c084fc', '#818cf8', '#38bdf8']} glowColor="270 70 75">
      <Panel>
        <FiltersContainer>
          <FilterInput
            type="text"
            placeholder="Pesquisar música"
            value={searchNome}
            aria-label="Pesquisar música"
            onChange={(e) => setSearchNome(e.target.value)}
          />

          <FilterDropdownWrapper ref={filterRef}>
            <FilterDropdownTrigger
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-label="Filtrar por categoria"
            >
              <span>{filterLabel}</span>
              <span style={{ fontSize: "0.7em", color: "#7c3aed",
                transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)",
                display: "inline-block", transition: "transform 0.2s" }}>▼</span>
            </FilterDropdownTrigger>

            {filterOpen && (
              <FilterDropdownPanel>
                <FilterDropdownItem $active={categoriaFiltro === ""}
                  onClick={() => { setCategoriaFiltro(""); setFilterOpen(false); }}>
                  Todas as categorias
                </FilterDropdownItem>
                {rootCategorias.map((root) => {
                  const children = categorias
                    .filter((c) => String(c.parent?._id || c.parent) === String(root._id))
                    .sort(sortByNome);
                  const isExpanded = filterExpanded.has(root._id);
                  if (children.length > 0) {
                    return (
                      <div key={root._id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <FilterDropdownItem $active={categoriaFiltro === root._id}
                            style={{ flex: 1 }}
                            onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}>
                            {root.nome}
                          </FilterDropdownItem>
                          <button type="button"
                            onClick={() => setFilterExpanded((prev) => {
                              const next = new Set(prev);
                              next.has(root._id) ? next.delete(root._id) : next.add(root._id);
                              return next;
                            })}
                            style={{ background: "none", border: "none", cursor: "pointer",
                              padding: "0 10px", fontSize: "0.7em", color: "#7c3aed",
                              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                            ▼
                          </button>
                        </div>
                        {isExpanded && children.map((child) => (
                          <FilterDropdownItem key={child._id} $active={categoriaFiltro === child._id} $indent
                            onClick={() => { setCategoriaFiltro(child._id); setFilterOpen(false); }}>
                            ↳ {child.nome}
                          </FilterDropdownItem>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <FilterDropdownItem key={root._id} $active={categoriaFiltro === root._id}
                      onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}>
                      {root.nome}
                    </FilterDropdownItem>
                  );
                })}
              </FilterDropdownPanel>
            )}
          </FilterDropdownWrapper>

          <FavBtn type="button" $active={favoritosMode}
            onClick={() => setFavoritosMode((m) => !m)}>
            {favoritosMode ? "♥" : "♡"} Favoritos
          </FavBtn>

          {(searchNome || categoriaFiltro) && (
            <button type="button" className="btn"
              onClick={() => { setSearchNome(""); setCategoriaFiltro(""); }}>
              Limpar
            </button>
          )}
        </FiltersContainer>

        {favoritosMode && favoritosIds.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Você ainda não tem favoritos.
          </p>
        ) : cifras.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Nenhuma cifra encontrada.
          </p>
        ) : (
          <>
            <CifraList>
              {cifras.map((cifra) => (
                <Link to={`/home/cifra/${cifra._id}`} key={cifra._id}>
                  <CifraItem>
                    <div className="cifra-head">
                      <h2>{cifra.nome}</h2>
                      <button
                        type="button"
                        className="heart-btn"
                        aria-label={favoritosSet.has(cifra._id) ? "Remover favorito" : "Adicionar favorito"}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorito(cifra._id); }}
                      >
                        {favoritosSet.has(cifra._id) ? "♥" : "♡"}
                      </button>
                    </div>
                    <div className="cifra-body">
                      {cifra.artista && (
                        <span className="cifra-artista">{cifra.artista}</span>
                      )}
                      <span className="cifra-cats">
                        {cifra.categorias?.map((cat, i) => (
                          <span key={typeof cat === "string" ? cat : cat?._id}>
                            {i > 0 && " · "}
                            {getCatLabel(cat)}
                          </span>
                        ))}
                      </span>
                    </div>
                  </CifraItem>
                </Link>
              ))}
            </CifraList>

            {pages > 1 && (
              <PaginationContainer>
                <PaginationButton disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}>
                  Anterior
                </PaginationButton>
                <PaginationInfo>Página {currentPage + 1} de {pages}</PaginationInfo>
                <PaginationButton disabled={currentPage + 1 >= pages}
                  onClick={() => setCurrentPage((p) => p + 1)}>
                  Próxima
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        )}
      </Panel>
      </BorderGlow>

      {/* ══ MODAIS DE PLAYLIST ══ */}

      {/* Criar */}
      {isCreating && (
        <ModalBox onSubmit={handleCreate}>
          <h3>Criar Playlist</h3>
          <div>
            <label htmlFor="create-nome">Nome da Playlist</label>
            <Input id="create-nome" name="nome" required placeholder="Nome da Playlist" />
          </div>
          <div>
            <MultSeletor className="playlist-mult" tipo="cifra"
              escolhidos={chosenCifras} addItem={setChosenCifras} />
          </div>
          <div>
            <label>Compartilhar com (emails)</label>
            <ShareInputRow>
              <Input type="text" placeholder="email@exemplo.com"
                value={createShareInput} onChange={(e) => setCreateShareInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault();
                  addEmailsToList(createShareInput, createShareEmails, setCreateShareEmails);
                  setCreateShareInput(""); setCreateShareSuggestions([]); }}} />
              <button type="button" className="btn"
                onClick={() => { addEmailsToList(createShareInput, createShareEmails, setCreateShareEmails);
                  setCreateShareInput(""); setCreateShareSuggestions([]); }}>
                Adicionar
              </button>
            </ShareInputRow>
            {createShareSuggestions.length > 0 && (
              <SuggestList>
                {createShareSuggestions.map((email) => (
                  <button key={email} type="button"
                    onClick={() => { addEmailsToList(email, createShareEmails, setCreateShareEmails);
                      setCreateShareInput(""); setCreateShareSuggestions([]); }}>
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
                    <button type="button" aria-label={`Remover ${email}`}
                      onClick={() => removeEmail(email, setCreateShareEmails)}>×</button>
                  </div>
                ))}
              </ShareList>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-danger"
              onClick={() => { setIsCreating(false); setChosenCifras([]); setCreateShareEmails([]); }}>
              Cancelar
            </button>
            <button type="submit" className="btn">Salvar</button>
          </div>
        </ModalBox>
      )}

      {/* Editar */}
      {modalEdit && chosen && (
        <ModalBox onSubmit={handleEdit}>
          <h3>Editar Playlist</h3>
          <div>
            <label htmlFor="edit-nome">Nome da Playlist</label>
            <Input id="edit-nome" name="nome" defaultValue={chosen.nome} required />
          </div>
          <div>
            <label>Músicas</label>
            <MultSeletor className="playlist-mult" tipo="cifra"
              escolhidos={chosenCifras} addItem={setChosenCifras} allowReorder />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-danger"
              onClick={() => { setModalEdit(false); setChosenCifras([]); }}>
              Cancelar
            </button>
            <button type="submit" className="btn">Salvar</button>
          </div>
        </ModalBox>
      )}

      {/* Compartilhar */}
      {shareModalOpen && shareTarget && (
        <ModalBox onSubmit={handleShareSubmit}>
          <h3>Compartilhar "{shareTarget.nome}"</h3>
          <div>
            <label>Emails</label>
            <ShareInputRow>
              <Input type="text" placeholder="email@exemplo.com"
                value={shareInput} onChange={(e) => setShareInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault();
                  addEmailsToList(shareInput, shareEmails, setShareEmails);
                  setShareInput(""); setShareSuggestions([]); }}} />
              <button type="button" className="btn"
                onClick={() => { addEmailsToList(shareInput, shareEmails, setShareEmails, sharedExistingEmails);
                  setShareInput(""); setShareSuggestions([]); }}>
                Adicionar
              </button>
            </ShareInputRow>
            {shareSuggestions.length > 0 && (
              <SuggestList>
                {shareSuggestions.map((email) => (
                  <button key={email} type="button"
                    onClick={() => { addEmailsToList(email, shareEmails, setShareEmails, sharedExistingEmails);
                      setShareInput(""); setShareSuggestions([]); }}>
                    {email}
                  </button>
                ))}
              </SuggestList>
            )}
            {sharedExistingEmails.length > 0 && (
              <ShareList>
                {sharedExistingEmails.map((email) => {
                  const ownerId = getOwnerId(shareTarget);
                  const canRemove = (ownerId && ownerId === currentUserId) || isAdmin;
                  return (
                    <div key={email} className="chip">
                      <span>{email}</span>
                      {canRemove && (
                        <button type="button" aria-label={`Remover ${email}`}
                          onClick={() => handleUnshare(email)}>×</button>
                      )}
                    </div>
                  );
                })}
              </ShareList>
            )}
            {shareEmails.length > 0 && (
              <ShareList>
                {shareEmails.map((email) => (
                  <div key={email} className="chip">
                    <span>{email}</span>
                    <button type="button" aria-label={`Remover ${email}`}
                      onClick={() => removeEmail(email, setShareEmails)}>×</button>
                  </div>
                ))}
              </ShareList>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-danger"
              onClick={() => { setShareModalOpen(false); setShareTarget(null);
                setSharedExistingEmails([]); setShareEmails([]); setShareInput(""); }}>
              Cancelar
            </button>
            <button type="submit" className="btn">Compartilhar</button>
          </div>
        </ModalBox>
      )}

      {/* Excluir */}
      {modalDelete && chosen && (
        <PlaylistModalDelete>
          <h3>Excluir "{chosen.nome}"?</h3>
          <p>Essa ação é irreversível e removerá a playlist permanentemente.</p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setModalDelete(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger"
              onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </PlaylistModalDelete>
      )}
    </HomeWrapper>
  );
}
