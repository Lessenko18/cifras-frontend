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
import {
  GuardaEscolhidos,
  MultSeletorContainer,
} from "../../components/MultSeletor/MultSeletorStyled";
import {
  getCategoriaById,
  searchCategoria,
} from "../../service/categoriaService";

export default function VerCifra() {
  const { id } = useParams();
  const [cifra, setCifra] = useState({});
  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [escolhidos, setEscolhidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  async function getCifra() {
    const response = await getCifraById(id);
    let listaCategorias = [];
    setCifra(response.data);
    for (const categoria of response.data.categorias) {
      const responseCat = await getCategoriaById(categoria);
      listaCategorias.push(responseCat.data);
    }
    setEscolhidos(listaCategorias);
    console.log(response.data.categorias);
  }

  async function handleUpdateCifra(event) {
    event.preventDefault();
    const formdata = new FormData(event.target);
    const data = Object.fromEntries(formdata.entries());
    data.categorias = escolhidos.map((c) => c._id);
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
  function handleSelect(item) {
    let lista = [...escolhidos];
    if (lista.find((i) => i._id == item._id)) {
      return;
    }
    lista.push(item);
    setEscolhidos(lista);
  }
  function removeSelect(item) {
    let lista = [...escolhidos];
    lista = lista.filter((i) => i._id != item._id);
    setEscolhidos(lista);
  }
  async function handleSearch(e) {
    var response = {};
    if (e.target.value.trim() == "") {
      setItems([]);
      return;
    }
    response = await searchCategoria(e.target.value);
    console.log(response.data);
    setCategorias(response.data);
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
      {/* UPDATE */}
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
            <MultSeletorContainer>
              <GuardaEscolhidos>
                {escolhidos.length > 0 &&
                  escolhidos.map((item) => (
                    <p key={item._id} onClick={() => removeSelect(item)}>
                      {item.nome}
                    </p>
                  ))}
              </GuardaEscolhidos>
              <h3>Adicionar categoria</h3>
              <Input
                type="text"
                placeholder="Pesquisar"
                onChange={(e) => handleSearch(e)}
              />
              {categorias.length > 0 &&
                categorias.map((item) => (
                  <p key={item._id} onClick={() => handleSelect(item)}>
                    {item.nome}
                  </p>
                ))}
            </MultSeletorContainer>
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
