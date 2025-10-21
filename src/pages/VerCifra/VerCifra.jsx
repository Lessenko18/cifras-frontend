import { useEffect, useRef, useState } from "react";
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
import { Velocimetro } from "../VerPlaylist/VerPlaylistStyled";
export default function VerCifra() {
  const { id } = useParams();
  const [cifra, setCifra] = useState({});
  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [escolhidos, setEscolhidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [scrolling, setScrolling] = useState(false);
  const [velocity, setVelocity] = useState(5);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  function interruptor() {
    setScrolling((s) => !s);
  }

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (scrolling) {
      const id = setInterval(() => {
        scrollBy(0, 1);
      }, velocity * 15);

      intervalRef.current = id;
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [scrolling, velocity]);
  async function getCifra() {
    const response = await getCifraById(id);
    let listaCategorias = [];
    setCifra(response.data);
    const partes = response.data.observacao.split("!!!");
    if (partes.length == 2) {
      setPart1(partes[0] || "");
      setPart2(partes[1] || "");
    } else {
      setPart1("");
      setPart2("");
    }

    for (const categoria of response.data.categorias) {
      const responseCat = await getCategoriaById(categoria);
      listaCategorias.push(responseCat.data);
    }
    setEscolhidos(listaCategorias);
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
    <VerCifraContainer className={part1 != "" && "partes"}>
      <UsersHeader>
        <Velocimetro>
          <button onClick={() => setVelocity((v) => Math.min(9, v + 2))}>
            -
          </button>
          <button onClick={interruptor}>
            {scrolling ? (
              <img src="/pause.svg" alt="pause" />
            ) : (
              <img src="/pause.svg" alt="play" />
            )}
          </button>
          <button onClick={() => setVelocity((v) => Math.max(1, v - 2))}>
            +
          </button>
        </Velocimetro>
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
          <CifraContent className={part1 != "" && "partes"}>
            <a target="_blank" href={cifra.link}>
              Acesse a cifra original
            </a>
            {part1 == "" && part2 == "" ? (
              <pre>{cifra.observacao}</pre>
            ) : (
              <div className="cifra-partes">
                {part1 != "" && <pre>{part1}</pre>}
                <span></span>
                {part2 != "" && <pre>{part2}</pre>}
              </div>
            )}
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
                    <p key={item._id}>
                      {item.nome}
                      <span
                        className="remove"
                        onClick={() => removeSelect(item)}
                      >
                        X
                      </span>
                    </p>
                  ))}
              </GuardaEscolhidos>
              <h3>Adicionar categoria</h3>
              <Input
                type="text"
                placeholder="Pesquisar a categoria"
                onChange={(e) => handleSearch(e)}
              />
              {categorias.length > 0 &&
                categorias.map((item) => (
                  <p key={item._id} onClick={() => handleSelect(item)}>
                    {item.nome}
                  </p>
                ))}
            </MultSeletorContainer>
            <button className="btn">Salvar Cifra</button>
            <p>Utilize "!!!" para separar a cifra em duas colunas</p>
            <TextareaAutosize
              name="observacao"
              defaultValue={cifra.observacao}
              minRows={2}
            />
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
