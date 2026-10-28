import { useEffect, useRef, useState, useCallback } from "react";
import { SkeletonRows } from "../../components/Skeleton/Skeleton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPublicAppUrl } from "../../utils/getPublicAppUrl";
import {
  getPlaylistViewService,
  setPlaylistPublicLinkService,
  setPlaylistTomService,
} from "../../service/playlistService";
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
import { detectKey, renderCifra } from "../../utils/cifraDoc";
import {
  getKeyAtOffset,
  getSemitonesTo,
  NOTES_DISPLAY,
  useAccidental,
  setAccidental,
  useSimplify,
} from "../../utils/transpose";
import { useWakeLock } from "../../hooks/useWakeLock";
import { exportPlaylistPdf, exportCifraPdf } from "../../utils/pdfExport";
import {
  hasOfflinePlaylist,
  loadOfflinePlaylist,
  removeOfflinePlaylist,
  saveOfflinePlaylist,
} from "../../utils/offlinePlaylist";
import TomExtras from "../../components/TomExtras/TomExtras";
import StageMode from "../../components/StageMode/StageMode";
import { FiDownloadCloud, FiLink, FiMonitor } from "react-icons/fi";
import { storage } from "../../lib/storage";

export default function VerPlaylist() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlineSaved, setOfflineSaved] = useState(() => hasOfflinePlaylist(id));
  const [fromCache, setFromCache] = useState(false);
  const [publicSlug, setPublicSlug] = useState(null);
  const acc = useAccidental(); // re-renderiza a lista ao trocar ♯/♭
  useSimplify(); // idem ao simplificar a cifra
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
  // Modo palco: null = fechado, número = índice da música em que ele abre
  const [stageStart, setStageStart] = useState(null);
  const [fontSize, setFontSize] = useState(() => {
    const saved = storage.get("cifra_fontSize");
    return saved ? parseInt(saved, 10) : 18;
  });
  const [velocimetroVisivel, setVelocimetroVisivel] = useState(true);

  useWakeLock();

  const changeFontSize = useCallback((delta) => {
    setFontSize((prev) => {
      const next = Math.min(30, Math.max(12, prev + delta));
      storage.set("cifra_fontSize", next);
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
  // Atualiza o tom: salva na playlist (vale para todos) e mantém cópia local
  // como fallback caso a gravação falhe (ex.: offline).
  function updateTom(songId, newSemitones) {
    setToms((prev) => ({ ...prev, [songId]: newSemitones }));
    if (newSemitones === 0) {
      storage.remove(`tom_${songId}`);
    } else {
      storage.set(`tom_${songId}`, newSemitones);
    }
    setPlaylistTomService(id, String(songId), newSemitones).catch(() => {
      toast.error("Não foi possível salvar o tom na playlist.");
    });
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
        let viewData;
        try {
          viewData = await getPlaylistViewService(id);
          // mantém a cópia offline atualizada quando há sinal
          if (hasOfflinePlaylist(id)) saveOfflinePlaylist(id, viewData);
        } catch (e) {
          // sem rede: usa a cópia salva neste aparelho, se existir
          const cached = !e.response && loadOfflinePlaylist(id);
          if (!cached) throw e;
          viewData = cached;
          setFromCache(true);
        }
        const ordenado = applySavedOrder(viewData, null);
        setPublicSlug(viewData.publicSlug || null);
        // "Tocar agora" da Home abre direto no modo palco
        if (searchParams.get("palco") === "1" && ordenado.musicas?.length) {
          setStageStart(0);
          setSearchParams({}, { replace: true });
        }
        setData(ordenado);

        // Tom da playlist (servidor) tem prioridade; o localStorage só cobre
        // playlists antigas que ainda não têm tom salvo.
        const savedToms = {};
        (ordenado.musicas || []).forEach((m) => {
          const sid = getMusicId(m);
          const remote = viewData.toms?.[String(sid)];
          if (typeof remote === "number") {
            savedToms[sid] = remote;
            return;
          }
          const saved = storage.get(`tom_${sid}`);
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
      const origKey = detectKey({ text: m.descricao, chordpro: m.chordpro });
      const tom = origKey ? getKeyAtOffset(origKey, semitones) : null;

      return {
        nome: m.nome,
        tom,
        bpm: m.bpm,
        text: renderCifra({ text: m.descricao, chordpro: m.chordpro }, semitones).text,
      };
    });

    exportPlaylistPdf({ nome: data.nome, musicas });
  }

  function handleExportMusicaPdf(m) {
    const songId = getMusicId(m);
    const semitones = toms[songId] || 0;
    const origKey = detectKey({ text: m.descricao, chordpro: m.chordpro });
    const tom = origKey ? getKeyAtOffset(origKey, semitones) : null;

    exportCifraPdf({
      nome: m.nome,
      tom,
      bpm: m.bpm,
      text: renderCifra({ text: m.descricao, chordpro: m.chordpro }, semitones).text,
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

  if (loading) return <Page><SkeletonRows count={6} /></Page>;
  if (err) return <Page>{err}</Page>;

  // Música com modal aberto
  const modalMusica = modalMusicaId
    ? data.musicas?.find((m) => String(getMusicId(m)) === String(modalMusicaId))
    : null;
  const modalOriginalKey = modalMusica
    ? detectKey({ text: modalMusica.descricao, chordpro: modalMusica.chordpro })
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
        {data.podeCompartilharLink && (
          <button
            type="button"
            className="export-pdf"
            aria-pressed={Boolean(publicSlug)}
            title="Gera um link somente leitura para enviar aos músicos (WhatsApp)"
            onClick={async () => {
              try {
                const { publicSlug: slug } = await setPlaylistPublicLinkService(id, !publicSlug);
                setPublicSlug(slug);
                if (slug) {
                  const url = `${getPublicAppUrl()}/p/${slug}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link público copiado!");
                  } catch {
                    toast.success(`Link público: ${url}`, { duration: 8000 });
                  }
                } else {
                  toast.success("Link público desativado.");
                }
              } catch {
                toast.error("Não foi possível alterar o link público.");
              }
            }}
          >
            <FiLink size={18} />
            {publicSlug ? "Desativar link" : "Link público"}
          </button>
        )}
        {publicSlug && (
          <button
            type="button"
            className="export-pdf"
            onClick={() =>
              navigator.clipboard
                ?.writeText(`${getPublicAppUrl()}/p/${publicSlug}`)
                .then(() => toast.success("Link copiado!"))
                .catch(() => toast.error("Não foi possível copiar."))
            }
          >
            Copiar link
          </button>
        )}
        {fromCache && <span role="status">Modo offline: dados salvos neste aparelho</span>}
        <button
          type="button"
          className="export-pdf"
          aria-pressed={offlineSaved}
          title="Guarda as cifras e o tom desta playlist neste aparelho para usar sem internet"
          onClick={() => {
            if (offlineSaved) {
              removeOfflinePlaylist(id);
              setOfflineSaved(false);
              toast.success("Cópia offline removida.");
            } else if (saveOfflinePlaylist(id, data)) {
              setOfflineSaved(true);
              toast.success("Playlist disponível offline neste aparelho.");
            } else {
              toast.error("Não foi possível salvar offline (armazenamento cheio).");
            }
          }}
        >
          <FiDownloadCloud size={18} />
          {offlineSaved ? "Offline ✓" : "Salvar offline"}
        </button>
        {data.musicas?.length > 0 && (
          <button
            type="button"
            className="export-pdf"
            aria-label="Abrir modo palco"
            onClick={() => setStageStart(musicaAtiva)}
          >
            <FiMonitor size={18} />
            Modo palco
          </button>
        )}
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
            const origKey = detectKey({ text: m.descricao, chordpro: m.chordpro });
            const currentKey = getKeyAtOffset(origKey, semitones);
            const conteudo = renderCifra({ text: m.descricao, chordpro: m.chordpro }, semitones);

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
                <CifraRenderer segments={conteudo.segments} style={{ fontSize: `${fontSize}px` }} />
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
            <div className="tom-semitom" role="group" aria-label="Grafia das notas">
              <button
                type="button"
                className={acc === "sharp" ? "ativo" : ""}
                aria-pressed={acc === "sharp"}
                onClick={() => setAccidental("sharp")}
              >
                Sustenido ♯
              </button>
              <button
                type="button"
                className={acc === "flat" ? "ativo" : ""}
                aria-pressed={acc === "flat"}
                onClick={() => setAccidental("flat")}
              >
                Bemol ♭
              </button>
            </div>
            <TomExtras currentKey={modalCurrentKey} />
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

      {stageStart !== null && (
        <StageMode
          songs={(data.musicas || []).map((m) => ({
            id: String(getMusicId(m)),
            nome: m.nome,
            artista: m.artista,
            text: m.descricao,
            chordpro: m.chordpro,
            bpm: m.bpm,
          }))}
          startIndex={stageStart}
          semitones={toms}
          onSemitonesChange={(songId, n) => updateTom(songId, n)}
          onClose={() => setStageStart(null)}
        />
      )}
    </Page>
  );
}
