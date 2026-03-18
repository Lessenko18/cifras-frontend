import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCifraService,
  editCifraService,
  getCifraById,
} from "../../service/cifraService";
import { getMeRequest } from "../../service/auth.service";
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
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [escolhidos, setEscolhidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaQuery, setCategoriaQuery] = useState("");
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [scrolling, setScrolling] = useState(false);
  const [velocity, setVelocity] = useState(5);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const ownerId = useMemo(() => {
    return (
      cifra?.criador?._id ||
      cifra?.criador ||
      cifra?.ownerId ||
      cifra?.userId ||
      cifra?.usuarioId ||
      cifra?.criadoPorId ||
      cifra?.createdById ||
      cifra?.owner?._id ||
      cifra?.user?._id ||
      cifra?.usuario?._id ||
      cifra?.criadoPor?._id ||
      cifra?.createdBy?._id ||
      cifra?.createdBy ||
      null
    );
  }, [cifra]);

  const canManageCifra = useMemo(() => {
    if (isAdmin) return true;

    const userId = authenticatedUser?._id || authenticatedUser?.id;
    if (!userId || !ownerId) return false;

    return String(userId) === String(ownerId);
  }, [authenticatedUser, isAdmin, ownerId]);

  function interruptor() {
    setScrolling((s) => !s);
  }

  useEffect(() => {
    let isMounted = true;

    async function syncAuthenticatedUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) {
          setAuthenticatedUser(null);
          setIsAdmin(false);
        }
        return;
      }

      try {
        const user = await getMeRequest();
        if (!isMounted) return;

        setAuthenticatedUser(user);
        setIsAdmin(String(user?.level || "").toUpperCase() === "ADM");
      } catch {
        if (isMounted) {
          setAuthenticatedUser(null);
          setIsAdmin(false);
        }
      }
    }

    syncAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!canManageCifra) {
      setUpdate(false);
      setModalDelete(false);
    }
  }, [canManageCifra]);

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

    if (!canManageCifra) {
      toast.error("Você não tem permissão para editar esta cifra.");
      setUpdate(false);
      return;
    }

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
  useEffect(() => {
    const query = categoriaQuery.trim();

    if (!query) {
      setCategorias([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await searchCategoria(query);
        setCategorias(response.data || []);
      } catch (err) {
        console.error(err);
        setCategorias([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [categoriaQuery]);

  async function handleDeleteCifra() {
    if (!canManageCifra) {
      toast.error("Você não tem permissão para excluir esta cifra.");
      setModalDelete(false);
      return;
    }

    try {
      await deleteCifraService(id);
      toast.success("Cifra excluída com sucesso!");
      navigate("/home/cifras");
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao excluir a cifra";

      toast.error(message);
      toast.error("Falha ao excluir a cifra.");
    }
  }

  useEffect(() => {
    getCifra();
  }, []);
  return (
    <VerCifraContainer className={part1 != "" && "partes"}>
      <UsersHeader>
        <div className="ver-cifra-left">
          <Velocimetro>
            <button
              type="button"
              aria-label="Diminuir velocidade da rolagem"
              onClick={() => setVelocity((v) => Math.min(9, v + 2))}
            >
              -
            </button>
            <button
              type="button"
              aria-label="Iniciar ou pausar rolagem"
              onClick={interruptor}
            >
              {scrolling ? (
                <img src="/pause.svg" alt="pause" />
              ) : (
                <img src="/pause.svg" alt="play" />
              )}
            </button>
            <button
              type="button"
              aria-label="Aumentar velocidade da rolagem"
              onClick={() => setVelocity((v) => Math.max(1, v - 2))}
            >
              +
            </button>
          </Velocimetro>
          <button
            type="button"
            aria-label="Voltar"
            className="ver-cifra-back"
            onClick={() => navigate(-1)}
          >
            <img
              src="/back.svg"
              alt="Voltar"
              title="Voltar"
              className="img-hover"
            />
          </button>
        </div>
        <Title>{cifra.nome}</Title>
        {canManageCifra && (
          <div className="btns-header">
            <button
              type="button"
              aria-label="Editar cifra"
              onClick={() => setUpdate(!update)}
            >
              <img src="/update.svg" alt="Update" title="editar" />
            </button>
            <button
              type="button"
              aria-label="Excluir cifra"
              onClick={() => setModalDelete(!modalDelete)}
            >
              <img src="/delete.svg" alt="Delete" title="Excluir" />
            </button>
          </div>
        )}
      </UsersHeader>
      {/* UPDATE */}
      <CifraBody>
        {!update || !canManageCifra ? (
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
                      <button
                        type="button"
                        className="remove"
                        aria-label={`Remover categoria ${item.nome}`}
                        onClick={() => removeSelect(item)}
                      >
                        X
                      </button>
                    </p>
                  ))}
              </GuardaEscolhidos>
              <h3>Adicionar categoria</h3>
              <Input
                type="text"
                placeholder="Pesquisar a categoria"
                value={categoriaQuery}
                aria-label="Pesquisar categoria"
                onChange={(e) => setCategoriaQuery(e.target.value)}
              />
              {categoriaQuery && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setCategoriaQuery("");
                    setCategorias([]);
                  }}
                >
                  Limpar filtro
                </button>
              )}
              {categorias.length > 0 &&
                categorias.map((item) => (
                  <p
                    key={item._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(item);
                      }
                    }}
                  >
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
          <h3>Excluir “{cifra.nome}”?</h3>
          <p>Essa ação é irreversível e removerá a cifra permanentemente.</p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setModalDelete(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteCifra}
              className="btn btn-danger"
            >
              Excluir
            </button>
          </div>
        </ModalDelete>
      )}
    </VerCifraContainer>
  );
}
