import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { createCifraService, getCifrasService } from "../../service/cifraService";
import { fetchCifraClub } from "../../service/cifraClubService";
import { getFavoritosService, toggleFavoritoService } from "../../service/favoritosService";
import {
  AnCifra,
  ModalCifra,
  CifrasBody,
  CifrasContainer,
  ModalOverlay,
  CloseX,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
  FiltersContainer,
  FilterInput,
  FilterDropdownWrapper,
  FilterDropdownTrigger,
  FilterDropdownPanel,
  FilterDropdownItem,
} from "./CifraStyled";
import { Input } from "../../components/Input/Input";
import { getCategoriasService } from "../../service/categoriaService";
import { Link, useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import { Title } from "../Playlist/PlaylistStyled";
import MultSeletor from "../../components/MultSeletor/MultSeletor";
import { useSearch } from "../../hooks/useSearch";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_ICONS = {
  "Igreja":    "⛪",
  "Sertanejo": "🤠",
  "Gospel":    "🙏",
  "Pop":       "🎤",
  "Rock":      "🎸",
  "MPB":       "🎵",
  "Infantil":  "🧒",
  "Natal":     "🎄",
  "Páscoa":    "✝️",
};

function getCategoryIcon(categoryName, parentName) {
  const search = (parentName || categoryName || "").toLowerCase();
  if (!search) return "🎵";
  const key = Object.keys(CATEGORY_ICONS).find((k) =>
    search.includes(k.toLowerCase())
  );
  return key ? CATEGORY_ICONS[key] : "🎵";
}

export default function Cifras() {
  const [cifras, setCifras] = useState([]);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [chosenCategorias, setChosenCategorias] = useState([]);
  const [sending, setSending] = useState(false);

  const [formNome, setFormNome] = useState("");
  const [formArtista, setFormArtista] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formBpm, setFormBpm] = useState("");
  const [formObservacao, setFormObservacao] = useState("");
  const [fetchingCifra, setFetchingCifra] = useState(false);

  const { search: searchNome, setSearch: setSearchNome, debounced } = useSearch();
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(new Set());
  const filterRef = useRef(null);

  const [favoritosIds, setFavoritosIds] = useState([]);
  const favoritosSet = useMemo(() => new Set(favoritosIds), [favoritosIds]);

  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const { isAuthenticated } = useAuth();

  const getCategoriaParentName = (categoria) => {
    if (!categoria) return "";
    if (categoria.parent?.nome) return categoria.parent.nome;
    const parentId =
      typeof categoria.parent === "string" ? categoria.parent : categoria.parent?._id;
    return categorias.find((c) => c._id === parentId)?.nome || "";
  };

  const rootCategorias = useMemo(
    () => categorias.filter((c) => !c.parent).sort((a, b) => a.nome.localeCompare(b.nome)),
    [categorias],
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
      (c) => String(c.parent?._id || c.parent) === String(cat._id),
    );
    if (hasChildren) return `${cat.nome} (todas)`;
    if (cat.parent?.nome) return `${cat.nome} · ${cat.parent.nome}`;
    return cat.nome;
  }, [categoriaFiltro, categorias]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategorias = useCallback(async () => {
    try {
      const response = await getCategoriasService();
      setCategorias(response.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCifras = useCallback(async () => {
    try {
      const res = await getCifrasService({
        nome: debounced || undefined,
        categorias: relevantCategoriaIds.length ? relevantCategoriaIds : undefined,
        page: currentPage,
        limit: 15,
      });
      const data = res.data;
      setCifras(data.cifras || []);
      setPages(data.pages || 0);
    } catch (err) {
      console.error(err);
    }
  }, [debounced, relevantCategoriaIds, currentPage]);

  useEffect(() => {
    getCategorias();
  }, [getCategorias]);

  useEffect(() => {
    if (!isAuthenticated) { setFavoritosIds([]); return; }
    getFavoritosService()
      .then(setFavoritosIds)
      .catch(() => {});
  }, [isAuthenticated]);

  const handleToggleFavorito = useCallback(async (cifraId) => {
    if (!requireAuth("Você precisa fazer login para favoritar músicas.")) return;
    try {
      const updated = await toggleFavoritoService(cifraId);
      setFavoritosIds(updated);
    } catch (err) {
      console.error(err);
    }
  }, [requireAuth]);

  useEffect(() => {
    fetchCifras();
  }, [fetchCifras]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debounced, categoriaFiltro]);

  const resetForm = useCallback(() => {
    setFormNome("");
    setFormArtista("");
    setFormLink("");
    setFormBpm("");
    setFormObservacao("");
    setChosenCategorias([]);
  }, []);

  const handleFetchCifra = useCallback(async () => {
    if (!formLink.trim()) {
      toast.warning("Cole o link da cifra primeiro.");
      return;
    }
    setFetchingCifra(true);
    try {
      const { nome, artista } = await fetchCifraClub(formLink.trim());
      if (nome) setFormNome(nome);
      if (artista) setFormArtista(artista);
      toast.success("Cifra carregada com sucesso!");
    } catch {
      toast.error("Não foi possível carregar a cifra. Verifique o link.");
    } finally {
      setFetchingCifra(false);
    }
  }, [formLink]);

  const handleCreateCifra = useCallback(
    async (event) => {
      event.preventDefault();
      setSending(true);

      const nome = formNome.trim();
      const link = formLink.trim();
      const observacao = formObservacao.trim();
      const artista = formArtista.trim();
      const bpm = formBpm.trim() ? Number(formBpm.trim()) : undefined;
      const categorias = chosenCategorias.map((c) => c._id);

      if (!nome || !link) {
        toast.warning("Preencha pelo menos Nome e Link da cifra.");
        setSending(false);
        return;
      }

      try {
        await createCifraService({ nome, link, observacao, artista, bpm, categorias });
        setIsCreating(false);
        resetForm();
        await fetchCifras();
        toast.success("Cifra cadastrada com sucesso!");
      } catch (err) {
        console.error(err);
        toast.error("Falha ao cadastrar a cifra.");
      } finally {
        setSending(false);
      }
    },
    [formNome, formLink, formObservacao, formArtista, formBpm, chosenCategorias, fetchCifras, resetForm],
  );

  const updateCategoria = useCallback((lista) => {
    setChosenCategorias(lista);
  }, []);

  return (
    <CifrasContainer>
      <UsersHeader>
        <button onClick={() => navigate(-1)}>
          <img src="/back.svg" alt="Voltar" className="img-hover" />
        </button>
        <Title>Cifras</Title>
        <button
          className="btn adicionar-primary"
          onClick={() => {
            if (!requireAuth("Você precisa fazer login para adicionar uma cifra.")) return;
            setIsCreating(true);
          }}
        >
          Adicionar Cifra
        </button>
      </UsersHeader>

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
            <span style={{
              fontSize: "0.7em", transition: "transform 0.2s", display: "inline-block",
              transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)", color: "#7c3aed",
            }}>▼</span>
          </FilterDropdownTrigger>

          {filterOpen && (
            <FilterDropdownPanel>
              <FilterDropdownItem
                $active={categoriaFiltro === ""}
                onClick={() => { setCategoriaFiltro(""); setFilterOpen(false); }}
              >
                Todas as categorias
              </FilterDropdownItem>

              {rootCategorias.map((root) => {
                const children = categorias
                  .filter((c) => String(c.parent?._id || c.parent) === String(root._id))
                  .sort((a, b) => a.nome.localeCompare(b.nome));
                const isExpanded = filterExpanded.has(root._id);

                if (children.length > 0) {
                  return (
                    <div key={root._id}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FilterDropdownItem
                          $active={categoriaFiltro === root._id}
                          style={{ flex: 1 }}
                          onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}
                        >
                          {root.nome}
                        </FilterDropdownItem>
                        <button
                          type="button"
                          onClick={() => setFilterExpanded((prev) => {
                            const next = new Set(prev);
                            next.has(root._id) ? next.delete(root._id) : next.add(root._id);
                            return next;
                          })}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            padding: "0 12px", fontSize: "0.7em", color: "#7c3aed",
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          }}
                        >▼</button>
                      </div>
                      {isExpanded && children.map((child) => (
                        <FilterDropdownItem
                          key={child._id}
                          $active={categoriaFiltro === child._id}
                          $indent
                          onClick={() => { setCategoriaFiltro(child._id); setFilterOpen(false); }}
                        >
                          ↳ {child.nome}
                        </FilterDropdownItem>
                      ))}
                    </div>
                  );
                }

                return (
                  <FilterDropdownItem
                    key={root._id}
                    $active={categoriaFiltro === root._id}
                    onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}
                  >
                    {root.nome}
                  </FilterDropdownItem>
                );
              })}
            </FilterDropdownPanel>
          )}
        </FilterDropdownWrapper>

        {(searchNome || categoriaFiltro) && (
          <button
            type="button"
            className="btn"
            onClick={() => { setSearchNome(""); setCategoriaFiltro(""); }}
          >
            Limpar filtro
          </button>
        )}
      </FiltersContainer>

      {isCreating && (
        <>
          <ModalOverlay onClick={() => { setIsCreating(false); resetForm(); }} />

          <ModalCifra onSubmit={handleCreateCifra}>
            <CloseX type="button" onClick={() => { setIsCreating(false); resetForm(); }}>
              ×
            </CloseX>

            <h3>Adicionar Nova Cifra</h3>

            <div>
              <label htmlFor="cifra-nome">Título da Música *</label>
              <Input
                id="cifra-nome"
                name="nome"
                required
                placeholder="Preencha o nome da música"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="cifra-artista">Artista</label>
              <Input
                id="cifra-artista"
                name="artista"
                placeholder="Nome do artista (opcional)"
                value={formArtista}
                onChange={(e) => setFormArtista(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="cifra-bpm">BPM (batidas por minuto)</label>
              <Input
                id="cifra-bpm"
                name="bpm"
                type="number"
                min={30}
                max={300}
                placeholder="Ex: 90 (opcional, dá pra ajustar depois)"
                value={formBpm}
                onChange={(e) => setFormBpm(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="cifra-link">Link da Cifra *</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Input
                  id="cifra-link"
                  name="link"
                  type="url"
                  required
                  placeholder="https://exemplo.com.br/sua-cifra"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={handleFetchCifra}
                  disabled={fetchingCifra}
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {fetchingCifra ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>

            <p>Utilize "!!!" para separar a cifra em duas colunas</p>

            <div>
              <label htmlFor="cifra-observacao">Cifra</label>
              <textarea
                id="cifra-observacao"
                name="observacao"
                placeholder={`Cole sua cifra aqui:\n      Am\nDoente de amor procurei remédio\n     G\nNa vida noturna`}
                value={formObservacao}
                onChange={(e) => setFormObservacao(e.target.value)}
              />
            </div>

            <MultSeletor tipo="categoria" escolhidos={chosenCategorias} addItem={updateCategoria} />

            <div className="actions modal-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => { setIsCreating(false); resetForm(); }}
              >
                Cancelar
              </button>
              {!sending ? (
                <button type="submit" className="btn">Adicionar</button>
              ) : (
                <p className="btn">Enviando</p>
              )}
            </div>
          </ModalCifra>
        </>
      )}

      <CifrasBody>
        {cifras.map((cifra) => (
          <Link key={cifra._id} to={`/home/cifra/${cifra._id}`}>
            <AnCifra>
              <button
                type="button"
                className="heart-btn"
                aria-label={favoritosSet.has(cifra._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorito(cifra._id);
                }}
              >
                {favoritosSet.has(cifra._id) ? "♥" : "♡"}
              </button>
              <h2>{cifra.nome}</h2>
              {cifra.artista && <p className="artista">{cifra.artista}</p>}
              <div>
                {cifra.categorias?.map((cat) => {
                  const catId = typeof cat === "string" ? cat : cat?._id;
                  const categoria = categorias.find((c) => c._id === catId);
                  const parentName = getCategoriaParentName(categoria);
                  const icon = getCategoryIcon(categoria?.nome, parentName);
                  return (
                    <span key={catId} title={parentName || undefined}>
                      {icon && icon}{icon && " "}
                      {categoria?.nome}
                    </span>
                  );
                })}
              </div>
            </AnCifra>
          </Link>
        ))}
      </CifrasBody>

      {pages > 1 && (
        <PaginationContainer>
          <PaginationButton
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Anterior
          </PaginationButton>
          <PaginationInfo>
            Página {currentPage + 1} de {pages}
          </PaginationInfo>
          <PaginationButton
            disabled={currentPage + 1 >= pages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Próxima
          </PaginationButton>
        </PaginationContainer>
      )}
    </CifrasContainer>
  );
}
