import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  const navigate = useNavigate();

  // CREATE
  async function handleCreateCifra(event) {
    setSending(true);
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const categoriasIds = formData.getAll("categoriaId[]");
    if (categoriasIds.length) data.categorias = categoriasIds;

    data.observacao = (data.observacao ?? "").trim();
    data.nome = (data.nome ?? "").trim();
    data.link = (data.link ?? "").trim();
    data.categorias = chosenCategorias.map((c) => c._id);

    if (!data.nome || !data.link) {
      toast.warning("Preencha pelo menos Nome e Link da cifra.");
      return;
    }

    try {
      await createCifraService(data);
      setIsCreating(false);
      event.target.reset();
      setChosenCategorias([]);
      await getCifras();
      setSending(false);
      toast.success("Cifra cadastrada com sucesso!");
    } catch (err) {
      console.error(err);
      setSending(false);
      toast.error("Falha ao cadastrar a cifra.");
    }
  }

  function UpdateCategoria(lista) {
    setChosenCategorias(lista);
  }
  async function getCifras() {
    setSending(true);
    try {
      const response = await getCifrasService();

      setCifras(response.data);
      setSending(false);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  }

  async function getCategorias() {
    try {
      const response = await getCategoriasService();

      setCategorias(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getCifras();
    getCategorias();
  }, []);

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
        <button
          className="btn"
          onClick={() => {
            setIsCreating(true);
            setModalEdit(false);
            setChosenCifra(null);
          }}
        >
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
        {cifras.length > 0 &&
          [...cifras]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((cifra) => (
              <Link to={"/home/cifra/" + cifra._id} key={cifra._id}>
                <AnCifra>
                  <div>
                    <h2>{cifra.nome}</h2>
                    <div>
                      {cifra.categorias.length > 0 &&
                        cifra.categorias.map((cat) => (
                          <span key={cat} style={{ marginRight: 8 }}>
                            {categorias.find((item) => item._id === cat)?.nome}
                          </span>
                        ))}
                    </div>
                  </div>
                </AnCifra>
              </Link>
            ))}
      </CifrasBody>
    </CifrasContainer>
  );
}
