import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaylistViewService } from "../../service/playlistService";
import {
  Page,
  Header,
  CifraCard,
  TituloMusica,
  TextoCifra,
  Empty,
} from "./VerPlaylistStyled";
import { Velocimetro } from "../../../../../Users/THIAGO/OneDrive - Univille/Documentos/Projetos Code/CifrasFront/src/pages/VerPlaylist/VerPlaylistStyled";

export default function VerPlaylist() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
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
      <button onClick={() => navigate(-1)}>
        <img
          src="/back.svg"
          alt="Voltar"
          title="Voltar"
          className="img-hover"
        />
      </button>
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
