import { useEffect, useMemo, useState } from "react";
import { Input } from "../../components/Input/Input";
import {
  Page,
  Title,
  CardsGrid,
  Card,
  CifrasGrid,
  ModalBox,
  ModalDelete,
} from "./PlaylistStyled";

import {
  getPlaylistsService,
  createPlaylistService,
  editPlaylistService,
  deletePlaylistService,
} from "../../service/playlistService";
import { getCifrasService } from "../../service/cifraService";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import toast from "react-hot-toast";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [cifras, setCifras] = useState([]);

  const [isCreating, setIsCreating] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [chosen, setChosen] = useState(null);
  const navigate = useNavigate();

  const cifrasById = useMemo(() => {
    const m = new Map();
    cifras.length > 0 && cifras.forEach((c) => m.set(c._id, c));
    return m;
  }, [cifras]);

  async function fetchPlaylists() {
    try {
      const res = await getPlaylistsService();
      setPlaylists(res.data || []);
    } catch (err) {
      alert("Falha ao carregar playlists.");
    }
  }

  async function fetchCifras() {
    try {
      const res = await getCifrasService();
      setCifras(res.data || []);
    } catch (err) {}
  }
  useEffect(() => {
    fetchPlaylists();
    fetchCifras();
  }, []);

  // Create
  async function handleCreate(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.cifras = form.getAll("cifras[]");

    if (!data.nome?.trim()) {
      toast.error("Informe o nome da playlist.");
      return;
    }

    setIsCreating(true);

    try {
      await createPlaylistService(data);
      toast.success("Playlist criada com sucesso!");
      e.target.reset();
      await fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao criar playlist.");
    } finally {
      setIsCreating(false);
    }
  }

  // Edit
  async function handleEdit(e) {
    e.preventDefault();
    if (!chosen?._id) return;

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.cifras = form.getAll("cifras[]");

    if (!data.nome?.trim()) {
      alert("Informe o nome da playlist.");
      return;
    }

    try {
      await editPlaylistService(chosen._id, data);
      setModalEdit(false);
      setChosen(null);
      toast.success("Playlist editada com sucesso!");
      await fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao editar playlist.");
    }
  }

  // Delete
  async function handleDelete() {
    if (!chosen?._id) return;
    try {
      await deletePlaylistService(chosen._id);
      setModalDelete(false);
      setChosen(null);
      toast.success("Playlist excluída com sucesso!");
      await fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao excluir playlist.");
    }
  }

  return (
    <Page>
      <UsersHeader>
        <button onClick={() => navigate(-1)}>
          <img
            src="/back.svg"
            alt="Voltar"
            title="Voltar"
            className="img-hover"
          />
        </button>
        <Title>Minhas Playlists</Title>
        <button className="btn" onClick={() => setIsCreating(true)}>
          Criar Nova Playlist
        </button>
      </UsersHeader>
      <CardsGrid>
        {playlists.length > 0 &&
          [...playlists]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((pl) => (
              <Card key={pl._id}>
                <h3>{pl.nome}</h3>
                <div className="count">
                  {Array.isArray(pl.cifras) ? pl.cifras.length : 0} música(s)
                </div>
                <div className="actions">
                  <button className="btn">Ver Músicas</button>
                  <button
                    className=" btn btn-success"
                    onClick={() => {
                      setChosen(pl);
                      setModalEdit(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className=" btn btn-danger"
                    onClick={() => {
                      setChosen(pl);
                      setModalDelete(true);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </Card>
            ))}
      </CardsGrid>

      {/* Modal Create */}
      {isCreating && (
        <ModalBox onSubmit={handleCreate}>
          <h3>Criar Playlist</h3>
          <div>
            <label>Nome da Playlist</label>
            <Input type="text" name="nome" required />
          </div>
          <div>
            <label>Músicas</label>
            <CifrasGrid>
              {cifras.map((c) => (
                <label key={c._id}>
                  <strong>{c.nome}</strong>
                  <input type="checkbox" name="cifras[]" value={c._id} />
                </label>
              ))}
            </CifrasGrid>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* Modal Edit */}
      {modalEdit && chosen && (
        <ModalBox onSubmit={handleEdit}>
          <h3>Editar Playlist</h3>
          <div>
            <label>Nome da Playlist</label>
            <Input
              type="text"
              name="nome"
              defaultValue={chosen.nome}
              required
            />
          </div>
          <div>
            <label>Músicas</label>
            <CifrasGrid>
              {cifras.length > 0 &&
                cifras.map((c) => (
                  <label key={c._id}>
                    <strong>{c.nome}</strong>
                    <input
                      type="checkbox"
                      name="cifras[]"
                      value={c._id}
                      defaultChecked={chosen.cifras?.some((it) =>
                        typeof it === "string"
                          ? it === c._id
                          : it?._id === c._id
                      )}
                    />
                  </label>
                ))}
            </CifrasGrid>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setModalEdit(false)}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* Modal Delete */}
      {modalDelete && chosen && (
        <ModalDelete>
          <h3>Excluir “{chosen.nome}”?</h3>
          <div>
            <button onClick={handleDelete} className="btn btn-danger">
              Excluir
            </button>
            <button className="btn" onClick={() => setModalDelete(false)}>
              Cancelar
            </button>
          </div>
        </ModalDelete>
      )}
    </Page>
  );
}
