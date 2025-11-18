import { useEffect, useState, useCallback } from "react";
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
  const [itensPerpage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  // Paginação
  const pages = Math.ceil(cifras.length / itensPerpage);
  const startIndex = currentPage * itensPerpage;
  const endIndex = startIndex + itensPerpage;
  const cifraPaginated = cifras.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 0 && page < pages) {
      setCurrentPage(page);
    }
  };

  // GET CIFRAS
  const getCifras = useCallback(async () => {
    setSending(true);
    try {
      const response = await getCifrasService();

      setCifras(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }, []);

  // CREATE CIFRA
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
        event.target.reset();
        setChosenCategorias([]);
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

  const UpdateCategoria = useCallback((lista) => {
    setChosenCategorias(lista);
  }, []);

  const getCategorias = useCallback(async () => {
    try {
      const response = await getCategoriasService();
      setCategorias(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCifras();
    getCategorias();
  }, [getCifras, getCategorias]);

  return (
    <CifrasContainer>
      {/* HEADER */}
      <UsersHeader>
        <button onClick={() => navigate(-1)}>
          <img
            src="/back.svg"
            alt="Voltar"
            title="Voltar"
            className="img-hover"
          />
        </button>
        <Title>Cifras</Title>
        <button className="btn" onClick={() => setIsCreating(true)}>
          Adicionar Cifra
        </button>
      </UsersHeader>

      {/* MODAL CREATE */}
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
              <label htmlFor="nome">Título da Música *</label>
              <Input
                type="text"
                name="nome"
                placeholder="Digite o título da música..."
                required
              />
            </div>

            <div>
              <label htmlFor="link">Link da Cifra *</label>
              <Input
                type="url"
                name="link"
                placeholder="https://..."
                required
              />
            </div>

            <p>Utilize "!!!" para separar a cifra em duas colunas</p>

            <div>
              <label htmlFor="observacao">Observação</label>
              <textarea name="observacao" style={{ resize: "vertical" }} />
            </div>

            <MultSeletor tipo="categoria" addItem={UpdateCategoria} />

            <div className="actions">
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setChosenCategorias([]);
                }}
              >
                Cancelar
              </button>
              {!sending ? (
                <button className="btn" type="submit">
                  Adicionar
                </button>
              ) : (
                <p className="btn">Enviando</p>
              )}
            </div>
          </ModalCifra>
        </>
      )}

      {/* LISTAGEM */}
      <CifrasBody>
        {cifraPaginated.length > 0 &&
          [...cifraPaginated]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((cifra, index) => (
              <Link
                to={`/home/cifra/${cifra._id}`}
                key={`${cifra._id}-${index}`}
              >
                <AnCifra>
                  <div>
                    <h2>{cifra.nome}</h2>
                    <div>
                      {cifra.categorias &&
                        cifra.categorias.length > 0 &&
                        cifra.categorias.map((cat) => (
                          <span
                            key={`${cifra._id}-${cat}`}
                            style={{ marginRight: 8 }}
                          >
                            {categorias.find((item) => item._id === cat)?.nome}
                          </span>
                        ))}
                    </div>
                  </div>
                </AnCifra>
              </Link>
            ))}
      </CifrasBody>

      {/* PAGINAÇÃO */}
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
