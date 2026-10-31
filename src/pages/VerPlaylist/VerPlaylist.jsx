import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SkeletonRows } from "../../components/Skeleton/Skeleton";
import { Page, Empty, PlaylistBody } from "./VerPlaylistStyled";
import { useAccidental, useSimplify } from "../../utils/transpose";
import { getMusicId, describeMusic, toPdfSong } from "../../utils/playlistMusic";
import { exportPlaylistPdf, exportCifraPdf } from "../../utils/pdfExport";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useFontSize } from "../../hooks/useFontSize";
import StageMode from "../../components/StageMode/StageMode";
import TomModal from "../../components/TomModal/TomModal";
import { usePlaylistView } from "./hooks/usePlaylistView";
import { useActiveMusic } from "./hooks/useActiveMusic";
import PlaylistHeader from "./components/PlaylistHeader";
import ControlesPlaylist from "./components/ControlesPlaylist";
import SumarioMusicas from "./components/SumarioMusicas";
import MusicaCard from "./components/MusicaCard";

export default function VerPlaylist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Modo palco: null = fechado, número = índice da música em que ele abre
  const [stageStart, setStageStart] = useState(null);
  const [modalMusicaId, setModalMusicaId] = useState(null); // música com o seletor de tom aberto
  const [controlesVisiveis, setControlesVisiveis] = useState(true);
  const [sumarioVisivel, setSumarioVisivel] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 850 : true,
  );

  const acc = useAccidental(); // re-renderiza a lista ao trocar ♯/♭
  useSimplify(); // idem ao simplificar a cifra
  useWakeLock();
  const { scrolling, setScrolling, toggle: toggleScroll, slower, faster } = useAutoScroll();
  const [fontSize, changeFontSize] = useFontSize();

  const { data, loading, err, fromCache, publicSlug, setPublicSlug, toms, updateTom } = usePlaylistView(id, {
    // "Tocar agora" da Home abre direto no modo palco
    onLoaded: (viewData) => {
      if (searchParams.get("palco") === "1" && viewData.musicas?.length) {
        setStageStart(0);
        setSearchParams({}, { replace: true });
      }
    },
  });
  const musicaAtiva = useActiveMusic(data?.musicas?.length || 0);

  if (loading) return <Page><SkeletonRows count={6} /></Page>;
  if (err) return <Page>{err}</Page>;

  const musicas = data.musicas || [];
  const semitonesOf = (m) => toms[getMusicId(m)] || 0;

  function scrollToMusica(index) {
    const elemento = document.getElementById(`musica-${index}`);
    if (!elemento) return;
    setScrolling(false);
    window.scrollTo({ top: elemento.offsetTop - 8, behavior: "smooth" });
  }

  function handleExportPlaylistPdf() {
    if (!musicas.length) return;
    exportPlaylistPdf({ nome: data.nome, musicas: musicas.map((m) => toPdfSong(m, semitonesOf(m))) });
  }

  // Música com o seletor de tom aberto
  const modalMusica = modalMusicaId
    ? musicas.find((m) => String(getMusicId(m)) === String(modalMusicaId))
    : null;
  const modalInfo = modalMusica ? describeMusic(modalMusica, toms[modalMusicaId] || 0) : null;

  return (
    <Page>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <img src="/back.svg" alt="Voltar" />
      </button>

      {controlesVisiveis && (
        <ControlesPlaylist
          scrolling={scrolling}
          onSlower={slower}
          onFaster={faster}
          onToggleScroll={toggleScroll}
          onFontSize={changeFontSize}
          sumarioVisivel={sumarioVisivel}
          onToggleSumario={() => setSumarioVisivel((v) => !v)}
        />
      )}

      <PlaylistHeader
        playlistId={id}
        data={data}
        publicSlug={publicSlug}
        onPublicSlugChange={setPublicSlug}
        fromCache={fromCache}
        onOpenStage={() => setStageStart(musicaAtiva)}
        onExportPdf={handleExportPlaylistPdf}
      />

      <div className="main-layout">
        {sumarioVisivel && (
          <SumarioMusicas
            musicas={musicas}
            ativo={musicaAtiva}
            onSelect={(i) => {
              scrollToMusica(i);
              if (window.innerWidth < 850) setSumarioVisivel(false);
            }}
          />
        )}

        <PlaylistBody>
          {musicas.map((m, i) => {
            const songId = getMusicId(m);
            const { originalKey, currentKey, doc } = describeMusic(m, semitonesOf(m));
            return (
              <MusicaCard
                key={`${songId}-${i}`}
                index={i}
                music={m}
                originalKey={originalKey}
                currentKey={currentKey}
                doc={doc}
                fontSize={fontSize}
                controlesVisiveis={controlesVisiveis}
                onExportPdf={() => exportCifraPdf(toPdfSong(m, semitonesOf(m)))}
                onToggleControles={() => setControlesVisiveis((v) => !v)}
                onOpenTom={() => setModalMusicaId(songId)}
              />
            );
          })}
          {musicas.length === 0 && <Empty>Esta playlist ainda não tem músicas.</Empty>}
        </PlaylistBody>
      </div>

      {modalInfo?.originalKey && (
        <TomModal
          currentKey={modalInfo.currentKey}
          accidental={acc}
          semitones={toms[modalMusicaId] || 0}
          onChange={(n) => updateTom(modalMusicaId, n)}
          onClose={() => setModalMusicaId(null)}
        />
      )}

      {stageStart !== null && (
        <StageMode
          songs={musicas.map((m) => ({
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
