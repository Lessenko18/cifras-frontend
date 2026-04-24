import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCifrasService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
import { getFavoritosService, toggleFavoritoService } from "../../service/favoritosService";
import { useSearch } from "../../hooks/useSearch";
import {
  AnCifra,
  HomeContainer,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
  FiltersContainer,
  FilterInput,
  FilterDropdownWrapper,
  FilterDropdownTrigger,
  FilterDropdownPanel,
  FilterDropdownItem,
} from "./HomeStyled";

const sortByNome = (a, b) =>
  (a?.nome || "").localeCompare(b?.nome || "", "pt-BR", { sensitivity: "base" });

export default function Home() {
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

  const rootCategorias = useMemo(
    () => categorias.filter((c) => !c.parent).sort(sortByNome),
    [categorias],
  );

  const findCategoria = (cat) => {
    const catId = typeof cat === "string" ? cat : cat?._id;
    return categorias.find((c) => c._id === catId);
  };

  const getCategoriaParentName = (categoria) => {
    if (!categoria) return "";
    if (categoria.parent?.nome) return categoria.parent.nome;
    const parentId =
      typeof categoria.parent === "string" ? categoria.parent : categoria.parent?._id;
    return categorias.find((c) => c._id === parentId)?.nome || "";
  };

  // IDs relevantes para o filtro (categoria selecionada + filhas)
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
    const parentName = getCategoriaParentName(cat);
    if (parentName) return `${cat.nome} · ${parentName}`;
    return cat.nome;
  }, [categoriaFiltro, categorias]);

  // Carrega categorias uma vez
  useEffect(() => {
    getCategoriasService()
      .then((res) => setCategorias(res.data || []))
      .catch(console.error);
  }, []);

  // Carrega favoritos do usuário
  useEffect(() => {
    getFavoritosService()
      .then(setFavoritosIds)
      .catch(() => {});
  }, []);

  const handleToggleFavorito = useCallback(async (cifraId) => {
    try {
      const updated = await toggleFavoritoService(cifraId);
      setFavoritosIds(updated);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Busca cifras no servidor sempre que filtros ou página mudam
  const fetchCifras = useCallback(async () => {
    if (favoritosMode && favoritosIds.length === 0) {
      setCifras([]);
      setPages(0);
      return;
    }
    try {
      const res = await getCifrasService({
        nome: debounced || undefined,
        categorias: relevantCategoriaIds.length ? relevantCategoriaIds : undefined,
        favoritos: favoritosMode ? favoritosIds : undefined,
        page: currentPage,
        limit: 15,
      });
      const data = res.data;
      setCifras(data.cifras || []);
      setPages(data.pages || 0);
    } catch (err) {
      console.error("Erro ao carregar cifras:", err);
    }
  }, [debounced, relevantCategoriaIds, currentPage, favoritosMode, favoritosIds]);

  useEffect(() => {
    fetchCifras();
  }, [fetchCifras]);

  // Reset de página quando filtro muda
  useEffect(() => {
    setCurrentPage(0);
  }, [debounced, categoriaFiltro, favoritosMode]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <HomeContainer>
      {/* FILTRO */}
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
            <span
              style={{
                fontSize: "0.7em",
                transition: "transform 0.2s",
                display: "inline-block",
                transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)",
                color: "#7c3aed",
              }}
            >
              ▼
            </span>
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
                  .sort(sortByNome);
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
                          onClick={() =>
                            setFilterExpanded((prev) => {
                              const next = new Set(prev);
                              next.has(root._id) ? next.delete(root._id) : next.add(root._id);
                              return next;
                            })
                          }
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            padding: "0 12px", fontSize: "0.7em", color: "#7c3aed",
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          }}
                        >
                          ▼
                        </button>
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

        <button
          type="button"
          onClick={() => setFavoritosMode((m) => !m)}
          style={{
            height: 44,
            borderRadius: 14,
            padding: "0 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${favoritosMode ? "#fda4af" : "#d1d5db"}`,
            background: favoritosMode ? "#fecdd3" : "transparent",
            color: favoritosMode ? "#e11d48" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          {favoritosMode ? "♥" : "♡"} Favoritos
        </button>

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

      {/* LISTAGEM */}
      {favoritosMode && favoritosIds.length === 0 ? (
        <p style={{ gridColumn: "1 / -1" }}>Você ainda não adicionou nenhum favorito.</p>
      ) : cifras.length > 0 ? (
        <>
          {cifras.map((cifra) => (
            <Link to={"/home/cifra/" + cifra._id} key={cifra._id}>
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
                <div>
                  <h2>{cifra.nome}</h2>
                  {cifra.artista && <p className="artista">{cifra.artista}</p>}
                  <div>
                    {cifra.categorias?.map((cat) => {
                      const categoria = findCategoria(cat);
                      const parentName = getCategoriaParentName(categoria);
                      const catKey = typeof cat === "string" ? cat : cat?._id;
                      return (
                        <span key={`${cifra._id}-${catKey}`}>
                          {categoria?.nome}
                          {parentName && (
                            <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 3 }}>
                              ({parentName})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </AnCifra>
            </Link>
          ))}

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
        </>
      ) : (
        <p style={{ gridColumn: "1 / -1" }}>Nenhuma cifra encontrada.</p>
      )}
    </HomeContainer>
  );
}
