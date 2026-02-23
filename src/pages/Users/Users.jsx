import { useEffect, useState } from "react";
import {
  createUserService,
  deleteUserService,
  getUsersService,
  editUserService,
} from "../../service/userService";
import {
  AnUser,
  ModalDelete,
  ModalUser,
  ModalEdit,
  UsersBody,
  UsersContainer,
  UsersHeader,
} from "./UsersStyled";
import { Input } from "../../components/Input/Input";
import { useNavigate } from "react-router-dom";
import { Title } from "../Playlist/PlaylistStyled";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [createUser, setCreateUser] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [chosenUser, setChosenUser] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);
  const navigate = useNavigate();

  async function getUsers() {
    const response = await getUsersService();
    setUsers(response.data);
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.level === "on") {
      data.level = "ADM";
    } else {
      data.level = "USER";
    }
    if (
      data.name.trim() === "" ||
      data.email.trim() === "" ||
      data.password.trim() === ""
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      const response = await createUserService(data);
      toast.success("Usuário cadastrado com sucesso");
    } catch (error) {
      toast.error("Erro ao cadastrar usuário");
    }
    setCreateUser(false);
    event.target.reset();
    await getUsers();
  }

  async function handleEditUser(event) {
    event.preventDefault();
    if (!chosenUser?._id) return;

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.level === "on") {
      data.level = "ADM";
    } else {
      data.level = "USER";
    }
    if (!data.password) delete data.password;
    try {
      const response = await editUserService(chosenUser._id, data);
      toast.success("Usuário editado com sucesso");
    } catch (error) {
      toast.error("Erro ao editar usuário");
    }
    setModalEdit(false);
    setChosenUser(null);
    getUsers();
  }

  async function handleDeleteUser() {
    if (!chosenUser?._id) return;
    await deleteUserService(chosenUser._id);
    try {
      toast.success("Usuário excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    }
    setModalDelete(false);
    setChosenUser(null);
    await getUsers();
  }

  function deleteClick(user) {
    setModalDelete(true);
    setChosenUser(user);
    setCreateUser(false);
    setModalEdit(false);
  }

  function editClick(user) {
    setChosenUser(user);
    setModalEdit(true);
    setModalDelete(false);
    setCreateUser(false);
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <UsersContainer>
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
        <Title>Usuários</Title>
        <button
          className="btn adicionar-primary"
          onClick={() => {
            setCreateUser(!createUser);
            setModalEdit(false);
            setChosenUser(null);
          }}
        >
          Adicionar Usuário
        </button>
      </UsersHeader>

      {/* MODAL CREATE */}
      {createUser && (
        <ModalUser onSubmit={handleCreateUser}>
          <h3>Cadastrar Usuário</h3>
          <div>
            <label htmlFor="name">Nome do Usuário</label>
            <Input
              type="text"
              name="name"
              required
              placeholder="Nome do usuário"
            />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <Input
              type="email"
              name="email"
              required
              placeholder="usuario@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <Input
              type="text"
              name="password"
              required
              placeholder="Digite a senha do usuário"
            />
          </div>
          <div id="inputLevel">
            <input type="checkbox" name="level" id="level" />
            <label htmlFor="level">ADM</label>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setCreateUser(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn">
              Cadastrar
            </button>
          </div>
        </ModalUser>
      )}
      {/* MODAL DELETE */}
      {modalDelete && chosenUser && (
        <ModalDelete>
          <h3>Excluir “{chosenUser.name || chosenUser.nome}”?</h3>
          <p>Essa ação é irreversível e removerá o usuário permanentemente.</p>
          <div>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setModalDelete(false);
                setChosenUser(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              className="btn btn-danger"
            >
              Excluir
            </button>
          </div>
        </ModalDelete>
      )}

      {/* MODAL EDIT*/}
      {modalEdit && chosenUser && (
        <ModalEdit key={chosenUser._id} onSubmit={handleEditUser}>
          <h3>Editar Usuário</h3>
          <div>
            <label htmlFor="name">Nome do Usuário</label>
            <Input
              type="text"
              name="name"
              defaultValue={chosenUser.name || ""}
              required
            />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <Input
              type="email"
              name="email"
              defaultValue={chosenUser.email || ""}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <Input
              type="text"
              name="password"
              placeholder="Deixe em branco para não alterar"
            />
          </div>
          <div id="inputLevel">
            <input
              type="checkbox"
              name="level"
              id="level_edit"
              defaultChecked={chosenUser.level === "ADM"}
            />
            <label htmlFor="level_edit">ADM</label>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setModalEdit(false);
                setChosenUser(null);
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
      <UsersBody>
        {users.length > 0 &&
          [...users]
            .sort((a, b) => {
              const nameA = a.name || a.nome || "";
              const nameB = b.name || b.nome || "";
              return nameA.localeCompare(nameB);
            })
            .map((user) => (
              <AnUser key={user._id || user.email}>
                <h2>{user.name || user.nome}</h2>
                <div>
                  <button className="btn" onClick={() => editClick(user)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteClick(user)}
                  >
                    Deletar
                  </button>
                </div>
              </AnUser>
            ))}
      </UsersBody>
    </UsersContainer>
  );
}
