import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  createCifraService,
  deleteCifraService,
  getCifrasService,
  editCifraService,
} from "../../service/cifraService";
import {
  AnCifra,
  ModalDelete,
  ModalCifra,
  CifrasBody,
  CifrasContainer,
  CategoriesGroup,
  CategoryItem,
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
  const [modalDelete, setModalDelete] = useState(false);
  const [chosenCifra, setChosenCifra] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);
  const navigate = useNavigate();

  // CREATE
  async function handleCreateCifra(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const categoriasIds = formData.getAll("categoriaId[]");
    if (categoriasIds.length) data.categorias = categoriasIds;

    data.observacao = (data.observacao ?? "").trim();
    data.nome = (data.nome ?? "").trim();
    data.link = (data.link ?? "").trim();

    if (!data.nome || !data.link) {
      toast.warning("Preencha pelo menos Nome e Link da cifra.");
      return;
    }

    try {
      await createCifraService(data);
      setIsCreating(false);
      event.target.reset();
      await getCifras();

      toast.success("Cifra cadastrada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao cadastrar a cifra.");
    }
  }

  function caraio(lista) {
    console.log("toma sua safada", lista);
  }

  //  EDIT
  async function handleEditCifra(event) {
    event.preventDefault();
    if (!chosenCifra?._id) return;

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const categoriasIds = formData.getAll("categoriaId[]");
    if (categoriasIds.length) data.categorias = categoriasIds;

    data.observacao = (data.observacao ?? "").trim();
    data.nome = (data.nome ?? "").trim();
    data.link = (data.link ?? "").trim();

    try {
      await editCifraService(chosenCifra._id, data);
      setModalEdit(false);
      setChosenCifra(null);
      await getCifras();
    } catch (err) {
      console.error(err);
      alert("Falha ao editar a cifra.");
    }
  }

  // LIST / DELETE
  async function getCifras() {
    try {
      const response = await getCifrasService();

      setCifras(response.data);
    } catch (err) {
      console.error(err);
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

  async function handleDeleteCifra() {
    if (!chosenCifra?._id) return;
    try {
      await deleteCifraService(chosenCifra._id);
      setModalDelete(false);
      setChosenCifra(null);
      await getCifras();
    } catch (err) {
      alert("Falha ao excluir a cifra.");
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
          <ModalOverlay onClick={() => setIsCreating(false)} />
          <ModalCifra onSubmit={handleCreateCifra}>
            <CloseX type="button" onClick={() => setIsCreating(false)}>
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

            <MultSeletor tipo="categoria" carainho={caraio} />

            {/* <div>
              <label htmlFor="categoriaId">Categorias *</label>
              {categorias.length > 0 ? (
                <CategoriesGroup>
                  {categorias.map((c) => (
                    <CategoryItem key={c._id}>
                      <input
                        type="checkbox"
                        name="categoriaId[]"
                        value={c._id}
                      />
                      <span>{c.nome}</span>
                    </CategoryItem>
                  ))}
                </CategoriesGroup>
              ) : (
                <Input
                  type="text"
                  name="categoria"
                  placeholder="Categoria (texto)"
                />
              )}
            </div> */}

            <div className="actions">
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </button>
              <button className="btn" type="submit">
                Adicionar
              </button>
            </div>
          </ModalCifra>
        </>
      )}

      {/*  MODAL EDIT  */}
      {modalEdit && chosenCifra && (
        <>
          <ModalOverlay
            onClick={() => {
              setModalEdit(false);
              setChosenCifra(null);
            }}
          />
          <ModalCifra onSubmit={handleEditCifra}>
            <CloseX
              type="button"
              onClick={() => {
                setModalEdit(false);
                setChosenCifra(null);
              }}
            >
              ×
            </CloseX>
            <h3>Editar Cifra</h3>

            <div>
              <label htmlFor="nome">Título da Música *</label>
              <Input
                placeholder="Digite o título da música..."
                type="text"
                name="nome"
                defaultValue={chosenCifra.nome || ""}
                required
              />
            </div>

            <div>
              <label htmlFor="link">Link da Cifra *</label>
              <Input
                type="url"
                name="link"
                defaultValue={chosenCifra.link || ""}
                required
              />
            </div>

            <div>
              <label htmlFor="observacao">Observação</label>
              <textarea
                name="observacao"
                defaultValue={chosenCifra.observacao || ""}
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label htmlFor="categoriaId">Categorias *</label>
              {categorias.length > 0 ? (
                <CategoriesGroup>
                  {categorias.map((c) => (
                    <CategoryItem key={c._id}>
                      <input
                        type="checkbox"
                        name="categoriaId[]"
                        value={c._id}
                        defaultChecked={chosenCifra.categorias?.some((it) =>
                          typeof it === "string"
                            ? it === c._id
                            : it?._id === c._id
                        )}
                      />
                      <span>{c.nome}</span>
                    </CategoryItem>
                  ))}
                </CategoriesGroup>
              ) : (
                <Input
                  type="text"
                  name="categoria"
                  defaultValue={chosenCifra.categoria || ""}
                  placeholder="Categoria (texto)"
                />
              )}
            </div>

            <div className="actions">
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => {
                  setModalEdit(false);
                  setChosenCifra(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn" type="submit">
                Salvar
              </button>
            </div>
          </ModalCifra>
        </>
      )}

      {/* MODAL DELETE  */}
      {modalDelete && chosenCifra && (
        <ModalDelete>
          <h3>Deseja excluir “{chosenCifra.nome}”?</h3>
          <div>
            <button onClick={handleDeleteCifra} className="btn btn-danger">
              Excluir
            </button>
            <button
              className="btn"
              onClick={() => {
                setModalDelete(false);
                setChosenCifra(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalDelete>
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
