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
  Velocimetro,
  Sumario,
  PlaylistBody,
} from "./VerPlaylistStyled";

export default function VerPlaylist() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [scrolling, setScrolling] = useState(false);
  const [velocity, setVelocity] = useState(5);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const [musicaAtiva, setMusicaAtiva] = useState(0);

  function interruptor() {
    setScrolling((s) => !s);
  }

  // auto scroll
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

  // rolar até música específica
  function scrollToMusica(index) {
    const elemento = document.getElementById(`musica-${index}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // destacar música ativa conforme rolagem
  useEffect(() => {
    if (!data?.musicas) return;

    const handler = () => {
      let ativo = 0;
      data.musicas.forEach((_, i) => {
        const el = document.getElementById(`musica-${i}`);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top < window.innerHeight / 2) ativo = i;
        }
      });
      setMusicaAtiva(ativo);
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [data?.musicas]);

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

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Sumário lateral */}
        <Sumario>
          {data.musicas?.map((m, i) => (
            <button
              key={`${m._id || m.nome}-${i}`}
              onClick={() => scrollToMusica(i)}
              className={i === musicaAtiva ? "ativo" : ""}
            >
              {m.nome}
            </button>
          ))}
        </Sumario>

        {/* Lista de músicas */}
        <PlaylistBody>
          {data.musicas?.map((m, i) => (
            <CifraCard key={`${m._id || m.nome}-${i}`} id={`musica-${i}`}>
              <TituloMusica>{m.nome}</TituloMusica>
              <TextoCifra>{m.descricao || ""}</TextoCifra>
            </CifraCard>
          ))}
        </PlaylistBody>
      </div>
    </Page>
  );
}
