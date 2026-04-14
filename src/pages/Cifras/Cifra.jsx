import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import {
  createCifraService,
  getCifrasService,
} from "../../service/cifraService";
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

export default function Cifras() {
  const [cifras, setCifras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [chosenCategorias, setChosenCategorias] = useState([]);
  const [sending, setSending] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [debouncedSearchNome, setDebouncedSearchNome] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(new Set());
  const filterRef = useRef(null);

  const [itensPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();

  /* ======================
     HELPERS
  ====================== */

  const normalize = (text = "") =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  /* ======================
     FILTROS
  ====================== */

  const rootCategorias = useMemo(
    () =>
      categorias
        .filter((c) => !c.parent)
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [categorias],
  );

  const cifrasFiltradas = useMemo(() => {
    const relevantIds = new Set();
    if (categoriaFiltro) {
      relevantIds.add(categoriaFiltro);
      // inclui subcategorias da categoria selecionada
      categorias.forEach((cat) => {
        const parentId = cat.parent?._id || cat.parent;
        if (String(parentId) === categoriaFiltro) relevantIds.add(cat._id);
      });
    }

    return cifras.filter((cifra) => {
      const matchNome = normalize(cifra.nome).includes(
        normalize(debouncedSearchNome),
      );

      const matchCategoria =
        !categoriaFiltro ||
        cifra.categorias?.some((cat) => {
          const catId = typeof cat === "string" ? cat : cat?._id;
          return relevantIds.has(catId);
        });

      return matchNome && matchCategoria;
    });
  }, [cifras, debouncedSearchNome, categoriaFiltro, categorias]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchNome(searchNome);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchNome]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchNome, categoriaFiltro]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /* ======================
     PAGINAÇÃO
  ====================== */

  const pages = Math.ceil(cifrasFiltradas.length / itensPerPage);
  const startIndex = currentPage * itensPerPage;
  const endIndex = startIndex + itensPerPage;
  const cifraPaginated = cifrasFiltradas.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 0 && page < pages) {
      setCurrentPage(page);
    }
  };

  const getCifras = useCallback(async () => {
    try {
      const response = await getCifrasService();
      setCifras(response.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getCategorias = useCallback(async () => {
    try {
      const response = await getCategoriasService();
      setCategorias(response.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCifras();
    getCategorias();
  }, [getCifras, getCategorias]);

  /* CREATE CIFRA */

  const handleCreateCifra = useCallback(
    async (event) => {
      event.preventDefault();
      setSending(true);

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      data.nome = (data.nome ?? "").trim();
      data.link = (data.link ?? "").trim();
      data.observacao = (data.observacao ?? "").trim();
      data.categorias = chosenCategorias.map((c) => c._id);

      if (!data.nome || !data.link) {
        toast.warning("Preencha pelo menos Nome e Link da cifra.");
        setSending(false);
        return;
      }

      try {
        await createCifraService(data);
        setIsCreating(false);
        setChosenCategorias([]);
        event.target.reset();
        await getCifras();
        toast.success("Cifra cadastrada com sucesso!");
      } catch (err) {
        console.error(err);
        toast.error("Falha ao cadastrar a cifra.");
      } finally {
        setSending(false);
      }
    },
    [chosenCategorias, getCifras],
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
          onClick={() => setIsCreating(true)}
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

      {isCreating && (
        <>
          <ModalOverlay
            onClick={() => {
              setIsCreating(false);
              setChosenCategorias([]);
            }}
          />

          <ModalCifra onSubmit={handleCreateCifra}>
            <CloseX
              type="button"
              onClick={() => {
                setIsCreating(false);
                setChosenCategorias([]);
              }}
            >
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
              />
            </div>

            <div>
              <label htmlFor="cifra-link">Link da Cifra *</label>
              <Input
                id="cifra-link"
                name="link"
                type="url"
                required
                placeholder="https://exemplo.com.br/sua-cifra"
              />
            </div>

            <p>Utilize "!!!" para separar a cifra em duas colunas</p>

            <div>
              <label htmlFor="cifra-observacao">Cifra</label>
              <textarea
                id="cifra-observacao"
                name="observacao"
                placeholder={`Cole sua cifra aqui:
      Am
Doente de amor procurei remédio
     G
Na vida noturna`}
              />
            </div>

            <MultSeletor
              tipo="categoria"
              escolhidos={chosenCategorias}
              addItem={updateCategoria}
            />

            <div className="actions modal-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setIsCreating(false);
                  setChosenCategorias([]);
                }}
              >
                Cancelar
              </button>

              {!sending ? (
                <button type="submit" className="btn">
                  Adicionar
                </button>
              ) : (
                <p className="btn">Enviando</p>
              )}
            </div>
          </ModalCifra>
        </>
      )}

      <CifrasBody>
        {cifraPaginated
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((cifra) => (
            <Link key={cifra._id} to={`/home/cifra/${cifra._id}`}>
              <AnCifra>
                <h2>{cifra.nome}</h2>
                <div>
                  {cifra.categorias?.map((cat) => {
                    const catId = typeof cat === "string" ? cat : cat?._id;
                    const categoria = categorias.find((c) => c._id === catId);
                    return (
                      <span key={catId}>
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
              </AnCifra>
            </Link>
          ))}
      </CifrasBody>

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
    </CifrasContainer>
  );
}
