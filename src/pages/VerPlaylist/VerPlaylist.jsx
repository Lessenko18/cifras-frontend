import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistViewService } from "../../service/playlistService";
import {
  Page,
  Header,
  CifraCard,
  TituloMusica,
  TextoCifra,
  Empty,
} from "./VerPlaylistStyled";

export default function VerPlaylist() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlaylistViewService(id);
        setData(res);
      } catch (e) {
        console.error(e);
        setErr("Não foi possível carregar a playlist.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Page>Carregando…</Page>;
  if (err) return <Page>{err}</Page>;
  if (!data)
    return (
      <Page>
        <Empty>Nada encontrado.</Empty>
      </Page>
    );

  return (
    <Page>
      <Header>
        <h2>{data.nome}</h2>
        <span>{data.musicas?.length || 0} música(s)</span>
      </Header>

      {(!data.musicas || data.musicas.length === 0) && (
        <Empty>Esta playlist ainda não tem músicas.</Empty>
      )}

      {data.musicas?.map((m) => (
        <CifraCard key={m._id}>
          <TituloMusica>{m.nome}</TituloMusica>
          <TextoCifra>{m.descricao || ""}</TextoCifra>
        </CifraCard>
      ))}
    </Page>
  );
}
