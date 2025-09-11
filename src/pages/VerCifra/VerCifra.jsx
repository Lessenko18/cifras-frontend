import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCifraService,
  editCifraService,
  getCifraById,
} from "../../service/cifraService";
import { UsersHeader } from "../Users/UsersStyled";
import {
  CifraBody,
  CifraContent,
  ModalDelete,
  UpdateCifra,
  VerCifraContainer,
} from "./VerCifraStyled";
import { Title } from "../Playlist/PlaylistStyled";
import { Input } from "../../components/Input/Input";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";

export default function VerCifra() {
  const { id } = useParams();
  const [cifra, setCifra] = useState({});
  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const navigate = useNavigate();

  async function getCifra() {
    const response = await getCifraById(id);
    setCifra(response.data);
  }

  async function handleUpdateCifra(event) {
    event.preventDefault();
    const formdata = new FormData(event.target);
    const data = Object.fromEntries(formdata.entries());

    try {
      await editCifraService(id, data);
      toast.success("Cifra atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao atualizar a cifra.");
    }
    setUpdate(false);
    getCifra();
  }

  async function handleDeleteCifra() {
    try {
      await deleteCifraService(id);
      toast.success("Cifra excluída com sucesso!");
      navigate("/home/cifras");
    } catch (err) {
      toast.error("Falha ao excluir a cifra.");
    }
  }

  useEffect(() => {
    getCifra();
  }, []);
  return (
    <VerCifraContainer>
      <UsersHeader>
        <button onClick={() => navigate(-1)}>
          <img
            src="/back.svg"
            alt="Voltar"
            title="Voltar"
            className="img-hover"
          />
        </button>
        <Title>{cifra.nome}</Title>
        <div className="btns-header">
          <button onClick={() => setUpdate(!update)}>
            <img src="/update.svg" alt="Update" title="editar" />
          </button>
          <button onClick={() => setModalDelete(!modalDelete)}>
            <img src="/delete.svg" alt="Delete" title="Excluir" />
          </button>
        </div>
      </UsersHeader>
      <CifraBody>
        {!update ? (
          <CifraContent>
            <a target="_blank" href={cifra.link}>
              Acesse a cifra original
            </a>
            <pre>{cifra.observacao}</pre>
          </CifraContent>
        ) : (
          <UpdateCifra onSubmit={handleUpdateCifra}>
            <div>
              <label htmlFor="nome">Nome da Música</label>
              <Input type="text" name="nome" defaultValue={cifra.nome} />
            </div>
            <div>
              <label htmlFor="nome">Link da cifra</label>
              <Input type="text" name="link" defaultValue={cifra.link} />
            </div>
            <TextareaAutosize
              name="observacao"
              defaultValue={cifra.observacao}
              minRows={2}
            />
            <button className="btn">Salvar Cifra</button>
          </UpdateCifra>
        )}
      </CifraBody>
      {/* MODAL DELETE  */}
      {modalDelete && (
        <ModalDelete>
          <h3>Deseja excluir “{cifra.nome}”?</h3>
          <div>
            <button onClick={handleDeleteCifra} className="btn btn-danger">
              Excluir
            </button>
            <button
              className="btn"
              onClick={() => {
                setModalDelete(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalDelete>
      )}
    </VerCifraContainer>
  );
}
