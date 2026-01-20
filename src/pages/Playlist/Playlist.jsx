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

  /* ======================
     MAP DE CIFRAS (opcional)
  ====================== */
  const cifrasById = useMemo(() => {
    const m = new Map();
    cifras.forEach((c) => m.set(c._id, c));
    return m;
  }, [cifras]);

  /* ======================
     HANDLERS
  ====================== */

  const updateCifra = useCallback((items) => {
    setChosenCifras(items);
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await getPlaylistsService();
      setPlaylists(res.data || []);
    } catch {
      toast.error("Falha ao carregar playlists.");
    }
  }, []);

  const fetchCifras = useCallback(async () => {
    try {
      const res = await getCifrasService();
      setCifras(res.data || []);
    } catch {
      toast.error("Falha ao carregar cifras.");
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
    fetchCifras();
  }, [fetchPlaylists, fetchCifras]);

  async function handleClickEdit(item) {
    const response = await getPlaylistViewService(item._id);
    setChosen(item);
    setChosenCifras(response.musicas || []);
    setModalEdit(true);
  }

  /* ======================
     CREATE
  ====================== */

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();

      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      if (!data.nome?.trim()) {
        toast.error("Informe o nome da playlist.");
        return;
      }

      data.cifras = chosenCifras.map((c) => c._id);

      try {
        await createPlaylistService(data);
        toast.success("Playlist criada com sucesso!");
        e.target.reset();
        setChosenCifras([]);
        setIsCreating(false);
        await fetchPlaylists();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao criar playlist.");
      }
    },
    [chosenCifras, fetchPlaylists]
  );

  /* ======================
     EDIT
  ====================== */

  const handleEdit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!chosen?._id) return;

      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      if (!data.nome?.trim()) {
        toast.error("Informe o nome da playlist.");
        return;
      }

      data.cifras = chosenCifras.map((c) => c._id || c.id);

      try {
        await editPlaylistService(chosen._id, data);
        toast.success("Playlist editada com sucesso!");
        setModalEdit(false);
        setChosen(null);
        setChosenCifras([]);
        await fetchPlaylists();
      } catch (err) {
        console.error(err);
        toast.error("Falha ao editar playlist.");
      }
    },
    [chosen, chosenCifras, fetchPlaylists]
  );

  const handleDelete = useCallback(async () => {
    if (!chosen?._id) return;

    try {
      await deletePlaylistService(chosen._id);
      toast.success("Playlist excluída com sucesso!");
      setModalDelete(false);
      setChosen(null);
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
          <img src="/back.svg" alt="Voltar" className="img-hover" />
        </button>
        <Title>Minhas Playlists</Title>
        <button
          className="btn"
          onClick={() => {
            setChosenCifras([]);
            setIsCreating(true);
          }}
        >
          Criar Nova Playlist
        </button>
      </UsersHeader>

      <CardsGrid>
        {[...playlists]
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
                  className="btn btn-success"
                  onClick={() => handleClickEdit(pl)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
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

      {/* CREATE */}
      {isCreating && (
        <ModalBox onSubmit={handleCreate}>
          <h3>Criar Playlist</h3>

          <div>
            <label>Nome da Playlist</label>
            <Input name="nome" required />
          </div>

          <div>
            <label>Músicas</label>
            <MultSeletor
              tipo="cifra"
              escolhidos={chosenCifras}
              addItem={updateCifra}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn">
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setIsCreating(false);
                setChosenCifras([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalBox>
      )}

      {/* EDIT */}
      {modalEdit && chosen && (
        <ModalBox onSubmit={handleEdit}>
          <h3>Editar Playlist</h3>

          <div>
            <label>Nome da Playlist</label>
            <Input
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
                addItem={updateCifra}
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

      {/* DELETE */}
      {modalDelete && chosen && (
        <ModalDelete>
          <h3>Excluir “{chosen.nome}”?</h3>
          <div>
            <button onClick={handleDelete} className="btn btn-danger">
              Excluir
            </button>
            <button
              className="btn"
              onClick={() => setModalDelete(false)}
            >
              Cancelar
            </button>
          </div>
        </ModalDelete>
      )}
    </Page>
  );
}
