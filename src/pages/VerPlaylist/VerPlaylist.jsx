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
  const [sumarioVisivel, setSumarioVisivel] = useState(true);

  function interruptor() {
    setScrolling((s) => !s);
  }

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (scrolling) {
      intervalRef.current = setInterval(() => {
        window.scrollBy(0, 1);
      }, velocity * 15);
    }
    return () => clearInterval(intervalRef.current);
  }, [scrolling, velocity]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlaylistViewService(id);
        setData(res);
      } catch (e) {
        setErr("Não foi possível carregar a playlist.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function scrollToMusica(index) {
    const elemento = document.getElementById(`musica-${index}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

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

  return (
    <Page>
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <img src="/back.svg" alt="Voltar" />
      </button>

      <Velocimetro>
        <button onClick={() => setVelocity((v) => Math.min(9, v + 2))}>
          {" "}
          -{" "}
        </button>
        <button onClick={interruptor}>
          <img src="/pause.svg" alt="toggle" />
        </button>
        <button onClick={() => setVelocity((v) => Math.max(1, v - 2))}>
          {" "}
          +{" "}
        </button>
      </Velocimetro>
      <button
        id={sumarioVisivel ? "Closeeye" : "Openeye"}
        onClick={() => setSumarioVisivel(!sumarioVisivel)}
      >
        <img
          src={sumarioVisivel ? "/closeeye.svg" : "/openeye.svg"}
          alt="toggle sumario"
        />
      </button>

      <Header>
        <h2>{data.nome}</h2>
        <span>{data.musicas?.length || 0} música(s)</span>
      </Header>

      <div className="main-layout">
        {sumarioVisivel && (
          <Sumario>
            <div style={{ fontWeight: "bold", padding: "10px", color: "#666" }}>
              Músicas
            </div>
            {data.musicas?.map((m, i) => (
              <button
                key={`${m._id || m.nome}-${i}`}
                onClick={() => {
                  scrollToMusica(i);
                  if (window.innerWidth < 850) setSumarioVisivel(false);
                }}
                className={i === musicaAtiva ? "ativo" : ""}
              >
                {m.nome}
              </button>
            ))}
          </Sumario>
        )}

        {/* CORPO DA PLAYLIST */}
        <PlaylistBody>
          {data.musicas?.map((m, i) => (
            <CifraCard key={`${m._id || m.nome}-${i}`} id={`musica-${i}`}>
              <TituloMusica>{m.nome}</TituloMusica>
              <TextoCifra>{m.descricao || ""}</TextoCifra>
            </CifraCard>
          ))}
          {(!data.musicas || data.musicas.length === 0) && (
            <Empty>Esta playlist ainda não tem músicas.</Empty>
          )}
        </PlaylistBody>
      </div>
    </Page>
  );
}
