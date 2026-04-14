import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCifrasService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
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

const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const sortByNome = (a, b) =>
  (a?.nome || "").localeCompare(b?.nome || "", "pt-BR", { sensitivity: "base" });

export default function Home() {
  const [cifras, setCifras] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [searchNome, setSearchNome] = useState("");
  const [debouncedSearchNome, setDebouncedSearchNome] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(new Set());
  const filterRef = useRef(null);

  const [itensPerpage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const rootCategorias = useMemo(
    () => categorias.filter((c) => !c.parent).sort(sortByNome),
    [categorias],
  );

  const cifrasFiltradas = useMemo(() => {
    const relevantIds = new Set();
    if (categoriaFiltro) {
      relevantIds.add(categoriaFiltro);
      categorias.forEach((cat) => {
        const parentId = cat.parent?._id || cat.parent;
        if (String(parentId) === categoriaFiltro) relevantIds.add(cat._id);
      });
    }

    return cifras.filter((cifra) => {
      const matchNome = normalize(cifra.nome).includes(normalize(debouncedSearchNome));
      const matchCategoria =
        !categoriaFiltro ||
        cifra.categorias?.some((cat) => {
          const catId = typeof cat === "string" ? cat : cat?._id;
          return relevantIds.has(catId);
        });
      return matchNome && matchCategoria;
    });
  }, [cifras, debouncedSearchNome, categoriaFiltro, categorias]);

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
    setCurrentPage(0);
  }, [debouncedSearchNome, categoriaFiltro]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchNome(searchNome), 300);
    return () => clearTimeout(timer);
  }, [searchNome]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resCifras, resCategorias] = await Promise.all([
          getCifrasService(),
          getCategoriasService(),
        ]);
        setCifras(resCifras.data || []);
        setCategorias(resCategorias.data || []);
      } catch (err) {
        console.error("Erro ao carregar cifras:", err);
      }
    }
    fetchData();
  }, []);

  const pages = Math.ceil(cifrasFiltradas.length / itensPerpage);
  const startIndex = currentPage * itensPerpage;
  const cifraPaginated = cifrasFiltradas.slice(startIndex, startIndex + itensPerpage);

  const handlePageChange = (page) => {
    if (page >= 0 && page < pages) setCurrentPage(page);
  };

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
            <span style={{
              fontSize: "0.7em",
              transition: "transform 0.2s",
              display: "inline-block",
              transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)",
              color: "#7c3aed",
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
            onClick={() => {
              setSearchNome("");
              setDebouncedSearchNome("");
              setCategoriaFiltro("");
            }}
          >
            Limpar filtro
          </button>
        )}
      </FiltersContainer>

      {/* LISTAGEM */}
      {cifraPaginated.length > 0 ? (
        <>
          {[...cifraPaginated]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((cifra) => (
              <Link to={"/home/cifra/" + cifra._id} key={cifra._id}>
                <AnCifra>
                  <div>
                    <h2>{cifra.nome}</h2>
                    <div>
                      {cifra.categorias?.map((cat) => {
                        const catId = typeof cat === "string" ? cat : cat?._id;
                        const categoria = categorias.find((c) => c._id === catId);
                        return (
                          <span key={`${cifra._id}-${catId}`}>
                            {categoria?.nome}
                            {categoria?.parent?.nome && (
                              <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 3 }}>
                                ({categoria.parent.nome})
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
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </PaginationButton>
              <PaginationInfo>
                Página {currentPage + 1} de {pages}
              </PaginationInfo>
              <PaginationButton
                disabled={currentPage + 1 === pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <p>Nenhuma cifra encontrada.</p>
      )}
    </HomeContainer>
  );
}
