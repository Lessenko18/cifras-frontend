import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaylistViewService } from "../../service/playlistService";
import {
  Page,
  Header,
  CifraCard,
  TituloMusica,
  Empty,
  Velocimetro,
  Sumario,
  PlaylistBody,
} from "./VerPlaylistStyled";
import { CifraRenderer } from "../../components/CifraRenderer/CifraRenderer";
import {
  ModalTom,
  Overlay,
  TomButton,
} from "../VerCifra/VerCifraStyled";
import {
  detectOriginalKey,
  getKeyAtOffset,
  getSemitonesTo,
  NOTES_DISPLAY,
  transposeText,
} from "../../utils/transpose";
import { useWakeLock } from "../../hooks/useWakeLock";
import { exportPlaylistPdf, exportCifraPdf } from "../../utils/pdfExport";

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
  const [sumarioVisivel, setSumarioVisivel] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 850 : true
  );

  // Transposição: { [songId]: semitones }
  const [toms, setToms] = useState({});
  // ID da música com modal de tom aberto (null = nenhum)
  const [modalMusicaId, setModalMusicaId] = useState(null);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("cifra_fontSize");
    return saved ? parseInt(saved, 10) : 18;
  });
  const [velocimetroVisivel, setVelocimetroVisivel] = useState(true);

  useWakeLock();

  const changeFontSize = useCallback((delta) => {
    setFontSize((prev) => {
      const next = Math.min(30, Math.max(12, prev + delta));
      localStorage.setItem("cifra_fontSize", next);
      return next;
    });
  }, []);

  function getMusicId(item) {
    if (!item) return null;
    return item._id || item.id || item.cifraId || item.musicaId || null;
  }

  function applySavedOrder(viewData, playlistData) {
    const sourceMusicas = Array.isArray(viewData?.musicas)
      ? viewData.musicas
      : [];
    const sourceOrder = Array.isArray(playlistData?.cifras)
      ? playlistData.cifras
      : [];

    if (sourceMusicas.length === 0 || sourceOrder.length === 0) {
      return viewData;
    }

    const orderMap = new Map();
    sourceOrder.forEach((entry, index) => {
      const id = getMusicId(entry);
      if (id) orderMap.set(String(id), index);
    });

    if (orderMap.size === 0) return viewData;

    const sortedMusicas = [...sourceMusicas].sort((a, b) => {
      const idA = String(getMusicId(a) || "");
      const idB = String(getMusicId(b) || "");
      const posA = orderMap.has(idA) ? orderMap.get(idA) : Number.MAX_SAFE_INTEGER;
      const posB = orderMap.has(idB) ? orderMap.get(idB) : Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });

    return { ...viewData, musicas: sortedMusicas };
  }

  // Atualiza o tom de uma música e persiste no localStorage
  function updateTom(songId, newSemitones) {
    setToms((prev) => ({ ...prev, [songId]: newSemitones }));
    if (newSemitones === 0) {
      localStorage.removeItem(`tom_${songId}`);
    } else {
      localStorage.setItem(`tom_${songId}`, newSemitones);
    }
  }

  function interruptor() {
    setScrolling((s) => !s);
  }

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (scrolling) {
      intervalRef.current = setInterval(() => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 2) {
          setScrolling(false);
          return;
        }
        window.scrollBy(0, 1);
      }, velocity * 15);
    }
    return () => clearInterval(intervalRef.current);
  }, [scrolling, velocity]);

  useEffect(() => {
    (async () => {
      try {
        const viewData = await getPlaylistViewService(id);
        const ordenado = applySavedOrder(viewData, null);
        setData(ordenado);

        // Carrega os tons salvos no localStorage para cada música
        const savedToms = {};
        (ordenado.musicas || []).forEach((m) => {
          const sid = getMusicId(m);
          const saved = localStorage.getItem(`tom_${sid}`);
          if (saved) savedToms[sid] = parseInt(saved, 10);
        });
        setToms(savedToms);
      } catch {
        setErr("Não foi possível carregar a playlist.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handleExportPlaylistPdf() {
    if (!data?.musicas?.length) return;

    const musicas = data.musicas.map((m) => {
      const songId = getMusicId(m);
      const semitones = toms[songId] || 0;
      const origKey = detectOriginalKey(m.descricao);
      const tom = origKey ? getKeyAtOffset(origKey, semitones) : null;

      return {
        nome: m.nome,
        tom,
        bpm: m.bpm,
        text: transposeText(m.descricao || "", semitones),
      };
    });

    exportPlaylistPdf({ nome: data.nome, musicas });
  }

  function handleExportMusicaPdf(m) {
    const songId = getMusicId(m);
    const semitones = toms[songId] || 0;
    const origKey = detectOriginalKey(m.descricao);
    const tom = origKey ? getKeyAtOffset(origKey, semitones) : null;

    exportCifraPdf({
      nome: m.nome,
      tom,
      bpm: m.bpm,
      text: transposeText(m.descricao || "", semitones),
    });
  }

  function scrollToMusica(index) {
    const elemento = document.getElementById(`musica-${index}`);
    if (elemento) {
      setScrolling(false);
      const offsetTop = elemento.offsetTop - 8;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
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

  // Música com modal aberto
  const modalMusica = modalMusicaId
    ? data.musicas?.find((m) => String(getMusicId(m)) === String(modalMusicaId))
    : null;
  const modalOriginalKey = modalMusica
    ? detectOriginalKey(modalMusica.descricao)
    : null;
  const modalSemitones = modalMusicaId ? (toms[modalMusicaId] || 0) : 0;
  const modalCurrentKey = getKeyAtOffset(modalOriginalKey, modalSemitones);

  return (
    <Page>
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <img src="/back.svg" alt="Voltar" />
      </button>

      {velocimetroVisivel && (
        <Velocimetro>
          <button onClick={() => setVelocity((v) => Math.min(9, v + 2))}>-</button>
          <button onClick={interruptor}>
            <img src="/pause.svg" alt="toggle" />
          </button>
          <button onClick={() => setVelocity((v) => Math.max(1, v - 2))}>+</button>
          <span className="velocimetro-sep" />
          <button aria-label="Diminuir tamanho do texto" onClick={() => changeFontSize(-2)}>A-</button>
          <button aria-label="Aumentar tamanho do texto" onClick={() => changeFontSize(2)}>A+</button>
          <span className="velocimetro-sep" />
          <button
            aria-label="Sumário"
            onClick={() => setSumarioVisivel(!sumarioVisivel)}
          >
            <img
              src={sumarioVisivel ? "/closeeye.svg" : "/openeye.svg"}
              alt="toggle sumario"
            />
          </button>
        </Velocimetro>
      )}

      <Header>
        <h2>{data.nome}</h2>
        <span>{data.musicas?.length || 0} música(s)</span>
        {data.musicas?.length > 0 && (
          <button
            type="button"
            className="export-pdf"
            aria-label="Exportar playlist em PDF"
            onClick={handleExportPlaylistPdf}
          >
            <img src="/pdf.svg" alt="Exportar PDF" title="Exportar playlist em PDF" />
            Exportar PDF
          </button>
        )}
      </Header>

      <div className="main-layout">
        {sumarioVisivel && (
          <Sumario>
            <div style={{ fontWeight: "bold", padding: "10px", color: "#666" }}>
              Músicas
            </div>
            {data.musicas?.map((m, i) => (
              <button
                key={`${getMusicId(m)}-${i}`}
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

        <PlaylistBody>
          {data.musicas?.map((m, i) => {
            const songId = getMusicId(m);
            const semitones = toms[songId] || 0;
            const origKey = detectOriginalKey(m.descricao);
            const currentKey = getKeyAtOffset(origKey, semitones);
            const conteudo = transposeText(m.descricao || "", semitones);

            return (
              <CifraCard key={`${songId}-${i}`} id={`musica-${i}`}>
                <div className="card-header">
                  <TituloMusica>{m.nome}</TituloMusica>
                  <div className="card-actions">
                    <button
                      className="eye-toggle"
                      type="button"
                      aria-label={`Exportar "${m.nome}" em PDF`}
                      title="Exportar cifra em PDF"
                      onClick={() => handleExportMusicaPdf(m)}
                    >
                      <img src="/pdf.svg" alt="Exportar PDF" />
                    </button>
                    <button
                      className="eye-toggle"
                      type="button"
                      aria-label="Mostrar/ocultar controles"
                      onClick={() => setVelocimetroVisivel((v) => !v)}
                    >
                      <img
                        src={velocimetroVisivel ? "/closeeye.svg" : "/openeye.svg"}
                        alt="toggle controles"
                      />
                    </button>
                    {origKey && (
                      <TomButton
                        type="button"
                        aria-label="Abrir seletor de tom"
                        onClick={() => setModalMusicaId(songId)}
                      >
                        <span className="tom-label">Tom:</span>
                        <span className="tom-value">{currentKey}</span>
                      </TomButton>
                    )}
                  </div>
                </div>
                <CifraRenderer text={conteudo} style={{ fontSize: `${fontSize}px` }} />
              </CifraCard>
            );
          })}
          {(!data.musicas || data.musicas.length === 0) && (
            <Empty>Esta playlist ainda não tem músicas.</Empty>
          )}
        </PlaylistBody>
      </div>

      {/* MODAL TOM */}
      {modalMusicaId && modalOriginalKey && (
        <>
          <Overlay onClick={() => setModalMusicaId(null)} />
          <ModalTom>
            <div className="tom-titulo">
              Tom: <span>{modalCurrentKey}</span>
            </div>
            <div className="tom-semitom">
              <button
                type="button"
                onClick={() => updateTom(modalMusicaId, modalSemitones - 1)}
              >
                - ½ tom
              </button>
              <button
                type="button"
                onClick={() => updateTom(modalMusicaId, modalSemitones + 1)}
              >
                + ½ tom
              </button>
            </div>
            <div className="tom-grid">
              {NOTES_DISPLAY.map((note) => (
                <button
                  key={note}
                  type="button"
                  className={getSemitonesTo(modalCurrentKey, note) === 0 ? "ativo" : ""}
                  onClick={() =>
                    updateTom(
                      modalMusicaId,
                      modalSemitones + getSemitonesTo(modalCurrentKey, note)
                    )
                  }
                >
                  {note}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="tom-restaurar"
              onClick={() => {
                updateTom(modalMusicaId, 0);
                setModalMusicaId(null);
              }}
            >
              Restaurar tom inicial
            </button>
          </ModalTom>
        </>
      )}
    </Page>
  );
}
