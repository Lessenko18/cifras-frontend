import { useEffect, useMemo, useRef, useState } from "react";
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

const selectStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.95rem",
  marginTop: "4px",
};

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [chosenCategoria, setChosenCategoria] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const initializedRef = useRef(false);

  function toggleCollapse(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  const navigate = useNavigate();

  const rootCategorias = useMemo(
    () =>
      categorias
        .filter((c) => !c.parent)
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [categorias],
  );

  const hasChildrenSet = useMemo(() => {
    const set = new Set();
    categorias.forEach((c) => {
      const parentId = c.parent?._id || c.parent;
      if (parentId) set.add(String(parentId));
    });
    return set;
  }, [categorias]);

  const grouped = useMemo(
    () =>
      rootCategorias.map((root) => ({
        ...root,
        children: categorias
          .filter((c) => String(c.parent?._id || c.parent) === String(root._id))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      })),
    [rootCategorias, categorias],
  );

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
      setIsCreating(false);
      event.target.reset();
      await getCategorias();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Falha ao cadastrar a categoria.",
      );
    }
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
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Falha ao editar a categoria.",
      );
    }
  }

  async function handleDeleteCategoria() {
    if (!chosenCategoria?._id) return;
    try {
      await deleteCategoriaService(chosenCategoria._id);
      setIsDeleting(false);
      toast.success("Categoria excluída com sucesso!");
      setChosenCategoria(null);
      await getCategorias();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Falha ao excluir a categoria.",
      );
    }
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

  // Recolhe automaticamente todas as categorias pai na primeira carga
  useEffect(() => {
    if (categorias.length === 0 || initializedRef.current) return;
    initializedRef.current = true;
    const parentIds = new Set();
    categorias.forEach((c) => {
      const parentId = String(c.parent?._id || c.parent || "");
      if (parentId) parentIds.add(parentId);
    });
    setCollapsed(parentIds);
  }, [categorias]);

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
          <div>
            <label>Subcategoria de (opcional)</label>
            <select name="parent" style={selectStyle}>
              <option value="">Nenhuma (categoria raiz)</option>
              {rootCategorias.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nome}
                </option>
              ))}
            </select>
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
          <h3>Excluir "{chosenCategoria.nome}"?</h3>
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
            <label>Nome da Categoria</label>
            <Input
              type="text"
              name="nome"
              defaultValue={chosenCategoria.nome || ""}
              required
            />
          </div>
          {!hasChildrenSet.has(String(chosenCategoria._id)) && (
            <div>
              <label>Subcategoria de (opcional)</label>
              <select
                name="parent"
                defaultValue={chosenCategoria.parent?._id || ""}
                style={selectStyle}
              >
                <option value="">Nenhuma (categoria raiz)</option>
                {rootCategorias
                  .filter((c) => c._id !== chosenCategoria._id)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nome}
                    </option>
                  ))}
              </select>
            </div>
          )}
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
        {grouped.map((root) =>
          root.children.length === 0 ? (
            <AnCategoria key={root._id}>
              <h2>{root.nome}</h2>
              <div>
                <button className="btn" onClick={() => editClick(root)}>
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteClick(root)}
                >
                  Deletar
                </button>
              </div>
            </AnCategoria>
          ) : (
            // Grupo com subcategorias: ocupa as 2 colunas
            <div key={root._id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <AnCategoria
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse(root._id)}
              >
                <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform: collapsed.has(root._id) ? "rotate(-90deg)" : "rotate(0deg)",
                      fontSize: "0.7em",
                      color: "#7c3aed",
                    }}
                  >
                    ▼
                  </span>
                  {root.nome}
                  <span style={{ fontSize: "0.72em", color: "#9ca3af", fontWeight: "400" }}>
                    ({root.children.length})
                  </span>
                </h2>
                <div onClick={(e) => e.stopPropagation()}>
                  <button className="btn" onClick={() => editClick(root)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteClick(root)}
                  >
                    Deletar
                  </button>
                </div>
              </AnCategoria>
              {!collapsed.has(root._id) &&
                root.children.map((child) => (
                  <div key={child._id} style={{ paddingLeft: "24px" }}>
                    <AnCategoria>
                      <h2>↳ {child.nome}</h2>
                      <div>
                        <button className="btn" onClick={() => editClick(child)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteClick(child)}
                        >
                          Deletar
                        </button>
                      </div>
                    </AnCategoria>
                  </div>
                ))}
            </div>
          ),
        )}
      </CategoriasBody>
    </CategoriasContainer>
  );
}
