import { useEffect, useState } from "react";
import {
  createCategoriaService,
  deleteCategoriaService,
  getCategoriasService,
  editCategoriaService,
} from "../../service/categoriaService";
import { Input } from "../../components/Input/Input";

import {
  CategoriasContainer,
  CategoriasBody,
  ModalCategoria,
  ModalDelete,
  ModalEdit,
  AnCategoria,
} from "./CategoriaStyled";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import { Title } from "../Playlist/PlaylistStyled";
import toast from "react-hot-toast";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [chosenCategoria, setChosenCategoria] = useState(null);
  const navigate = useNavigate();

  async function getCategorias() {
    const response = await getCategoriasService();
    setCategorias(response.data);
  }

  async function handleCreateCategoria(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.nome.trim() === "") {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await createCategoriaService(data);
      toast.success("Categoria cadastrada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao cadastrar a categoria.");
    }

    setIsCreating(false);
    event.target.reset();
    await getCategorias();
  }

  async function handleEditCategoria(event) {
    event.preventDefault();
    if (!chosenCategoria?._id) return;

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await editCategoriaService(chosenCategoria._id, data);
      setIsEditing(false);
      setChosenCategoria(null);
      await getCategorias();
      toast.success("Categoria editada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao editar a categoria.");
    }
  }

  async function handleDeleteCategoria() {
    if (!chosenCategoria?._id) return;
    try {
      await deleteCategoriaService(chosenCategoria._id);
      setIsDeleting(false);
      toast.success("Categoria excluída com sucesso!");
    } catch (err) {
      console.log(err);
      toast.error("Falha ao excluir a categoria.");
    }
    setChosenCategoria(null);
    await getCategorias();
  }

  function deleteClick(categoria) {
    setIsDeleting(true);
    setChosenCategoria(categoria);
    setIsCreating(false);
    setIsEditing(false);
  }

  function editClick(categoria) {
    setChosenCategoria(categoria);
    setIsEditing(true);
    setIsDeleting(false);
    setIsCreating(false);
  }

  useEffect(() => {
    getCategorias();
  }, []);

  return (
    <CategoriasContainer>
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
        <Title>Categorias</Title>
        <button
          className="btn adicionar-primary"
          onClick={() => {
            setIsCreating(!isCreating);
            setIsEditing(false);
            setChosenCategoria(null);
          }}
        >
          Adicionar Categoria
        </button>
      </UsersHeader>

      {/* MODAL CREATE */}
      {isCreating && (
        <ModalCategoria onSubmit={handleCreateCategoria}>
          <h3>Cadastrar Categoria</h3>
          <div>
            <label htmlFor="nome">Nome da Categoria</label>
            <Input
              type="text"
              name="nome"
              required
              placeholder="Digite o nome da categoria"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn">
              Cadastrar
            </button>
          </div>
        </ModalCategoria>
      )}

      {/* MODAL DELETE */}
      {isDeleting && chosenCategoria && (
        <ModalDelete>
          <h3>Excluir “{chosenCategoria.nome}”?</h3>
          <p>
            Essa ação é irreversível e removerá a categoria permanentemente.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsDeleting(false);
                setChosenCategoria(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteCategoria}
              className="btn btn-danger"
            >
              Excluir
            </button>
          </div>
        </ModalDelete>
      )}

      {/* MODAL EDIT */}
      {isEditing && chosenCategoria && (
        <ModalEdit key={chosenCategoria._id} onSubmit={handleEditCategoria}>
          <h3>Editar Categoria</h3>
          <div>
            <label htmlFor="nome">Nome da Categoria</label>
            <Input
              type="text"
              name="nome"
              defaultValue={chosenCategoria.nome || ""}
              required
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setIsEditing(false);
                setChosenCategoria(null);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn">
              Salvar
            </button>
          </div>
        </ModalEdit>
      )}

      {/* LISTAGEM */}
      <CategoriasBody>
        {categorias.length > 0 &&
          [...categorias]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((categoria) => (
              <AnCategoria key={categoria._id}>
                <h2>{categoria.nome}</h2>
                <div>
                  <button className="btn" onClick={() => editClick(categoria)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteClick(categoria)}
                  >
                    Deletar
                  </button>
                </div>
              </AnCategoria>
            ))}
      </CategoriasBody>
    </CategoriasContainer>
  );
}
