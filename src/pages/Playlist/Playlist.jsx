import { useCallback, useEffect, useMemo, useState } from "react";
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
  getPlaylistViewService,
} from "../../service/playlistService";
import { getCifrasService } from "../../service/cifraService";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import toast from "react-hot-toast";
import MultSeletor from "../../components/MultSeletor/MultSeletor";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [cifras, setCifras] = useState([]);

  const [isCreating, setIsCreating] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [chosenCifras, setChosenCifras] = useState([]);
  const navigate = useNavigate();

  const cifrasById = useMemo(() => {
    const m = new Map();
    cifras.length > 0 && cifras.forEach((c) => m.set(c._id, c));
    return m;
  }, [cifras]);

  const UpdateCifra = useCallback((items) => {
    setChosenCifras(items);
  }, []);
  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await getPlaylistsService();
      setPlaylists(res.data || []);
    } catch (err) {
      alert("Falha ao carregar playlists.");
    }
  }, []);

  async function handleClickEdit(item) {
    const response = await getPlaylistViewService(item._id);
    setChosenCifras(response.musicas);
    setChosen(item);
    setModalEdit(true);
  }

  const fetchCifras = useCallback(async () => {
    try {
      const res = await getCifrasService();
      setCifras(res.data || []);
    } catch (err) {}
  }, []);
  useEffect(() => {
    fetchPlaylists();
    fetchCifras();
  }, []);

  // Create
  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());
      data.cifras = chosenCifras.map((c) => c._id);

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
    },
    [chosenCifras, fetchPlaylists]
  );

  // Edit
  const handleEdit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!chosen?._id) return;

      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      data.cifras = chosenCifras.map((c) => c._id || c.id);
      console.log(chosenCifras);

      if (!data.nome?.trim()) {
        toast.error("Informe o nome da playlist.");
        return;
      }

      try {
        await editPlaylistService(chosen._id, data);
        setModalEdit(false);
        setChosenCifras([]);
        setChosen(null);
        toast.success("Playlist editada com sucesso!");
        await fetchPlaylists();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao editar playlist.");
      }
    },
    [chosen, chosenCifras, fetchPlaylists]
  );

  // Delete
  const handleDelete = useCallback(async () => {
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
  }, [chosen, fetchPlaylists]);

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
                <div className="count">{pl.cifras?.length || 0} música(s)</div>
                <div className="actions">
                  <button
                    className="btn"
                    onClick={() => navigate(`/home/playlists/${pl._id}/ver`)}
                  >
                    Ver Músicas
                  </button>
                  <button
                    className=" btn btn-success"
                    onClick={() => handleClickEdit(pl)}
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
            <MultSeletor tipo="cifra" addItem={UpdateCifra} />
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
              <MultSeletor
                tipo="cifra"
                escolhidos={chosenCifras}
                addItem={UpdateCifra}
              />
            </CifrasGrid>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setModalEdit(false);
                setChosenCifras([]);
              }}
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
