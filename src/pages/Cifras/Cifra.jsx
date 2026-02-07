import { useEffect, useState, useCallback, useMemo } from "react";
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
  FilterSelect,
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
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

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

  const cifrasFiltradas = useMemo(() => {
    return cifras.filter((cifra) => {
      const matchNome = normalize(cifra.nome).includes(normalize(searchNome));

      const matchCategoria =
        !categoriaFiltro ||
        cifra.categorias?.some((cat) => {
          if (typeof cat === "string") return cat === categoriaFiltro;
          if (typeof cat === "object" && cat._id)
            return cat._id === categoriaFiltro;
          return false;
        });

      return matchNome && matchCategoria;
    });
  }, [cifras, searchNome, categoriaFiltro]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchNome, categoriaFiltro]);

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

  /* ======================
     CREATE CIFRA
  ====================== */

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
    [chosenCategorias, getCifras]
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
        <button className="btn" onClick={() => setIsCreating(true)}>
          Adicionar Cifra
        </button>
      </UsersHeader>

      <FiltersContainer>
        <FilterInput
          type="text"
          placeholder="Pesquisar música"
          value={searchNome}
          onChange={(e) => setSearchNome(e.target.value)}
        />

        <FilterSelect
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.nome}
            </option>
          ))}
        </FilterSelect>
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
              <label>Título da Música *</label>
              <Input name="nome" required />
            </div>

            <div>
              <label>Link da Cifra *</label>
              <Input name="link" type="url" required />
            </div>

            <p>Utilize "!!!" para separar a cifra em duas colunas</p>

            <div>
              <label>Cifra</label>
              <textarea name="observacao" />
            </div>

            <MultSeletor
              tipo="categoria"
              escolhidos={chosenCategorias}
              addItem={updateCategoria}
            />

            <div className="actions">
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
                    return <span key={catId}>{categoria?.nome || "—"}</span>;
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
