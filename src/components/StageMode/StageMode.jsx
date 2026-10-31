import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMinus,
  FiMoon,
  FiPause,
  FiPlay,
  FiPlus,
  FiSun,
  FiX,
} from "react-icons/fi";
import { CifraRenderer } from "../CifraRenderer/CifraRenderer";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useMetronome } from "../../hooks/useMetronome";
import { detectKey, renderCifra } from "../../utils/cifraDoc";
import { getKeyAtOffset, useAccidental, useSimplify } from "../../utils/transpose";
import { Root, TopBar, BottomBar, Scroller, Page, BeatDot, Group, Hint } from "./StageModeStyled";
import { storage } from "../../lib/storage";

const MIN_FONT = 16;
const MAX_FONT = 64;
const HIDE_CONTROLS_MS = 3500;
const SWIPE_MIN_PX = 80;

const readStored = (key, fallback) => {
  try {
    return storage.get(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const store = (key, value) => {
  try {
    storage.set(key, value);
  } catch {
    // modo privado etc.: só não lembra da preferência
  }
};

// Tom em semitons mantido entre -5 e +6 (o caminho mais curto até a nota)
const wrapSemitones = (n) => {
  const m = ((n % 12) + 12) % 12;
  return m > 6 ? m - 12 : m;
};

/**
 * Modo palco: tela cheia, letra grande, sem distrações, pra tocar ao vivo.
 *
 * songs: [{ id, nome, artista?, text, chordpro?, bpm? }]
 * semitones: { [id]: n }  tom atual de cada música (controlado por quem usa)
 * onSemitonesChange(id, n)
 */
export default function StageMode({ songs, startIndex = 0, semitones = {}, onSemitonesChange, onClose }) {
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(songs.length - 1, 0)));
  const [fontSize, setFontSize] = useState(() => {
    const n = parseInt(readStored("stage_fontSize", "28"), 10);
    return Number.isFinite(n) ? Math.min(MAX_FONT, Math.max(MIN_FONT, n)) : 28;
  });
  const [theme, setTheme] = useState(() => (readStored("stage_theme", "dark") === "light" ? "light" : "dark"));
  const [controlsVisible, setControlsVisible] = useState(true);

  const scrollerRef = useRef(null);
  const { scrolling, setScrolling, toggle: toggleScroll, slower, faster } = useAutoScroll({
    getScroller: () => scrollerRef.current,
    pauseOnKeys: false, // as teclas são tratadas abaixo
  });
  const hideTimerRef = useRef(null);
  const touchRef = useRef(null);
  const enteredFullscreenRef = useRef(false);
  // Quem usa passa um onClose novo a cada render; guardar numa ref evita
  // reentrar/sair da tela cheia toda vez que a tela atualiza.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const close = useCallback(() => onCloseRef.current(), []);

  const song = songs[index];
  const total = songs.length;
  const multi = total > 1;
  const st = semitones[song?.id] || 0;

  useWakeLock();
  const metronome = useMetronome(song?.bpm || 90);
  const { setBpm } = metronome;

  // Cada música chega no BPM salvo nela
  useEffect(() => {
    if (song?.bpm) setBpm(song.bpm);
  }, [song?.bpm, song?.id, setBpm]);

  const acc = useAccidental();
  const simple = useSimplify();
  // Cifra transposta (do ChordPro, se tiver) + tom exibido
  const doc = useMemo(
    () => renderCifra({ text: song?.text, chordpro: song?.chordpro }, st),
    [song?.text, song?.chordpro, st, acc, simple],
  );
  const originalKey = useMemo(
    () => detectKey({ text: song?.text, chordpro: song?.chordpro }),
    [song?.text, song?.chordpro],
  );
  const currentKey = originalKey ? getKeyAtOffset(originalKey, st) : null; // recalcula a cada render, acompanha `acc`

  /* ---------- controles que somem sozinhos ---------- */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_MS);
  }, []);

  useEffect(() => {
    showControls();
    return () => clearTimeout(hideTimerRef.current);
  }, [showControls]);

  /* ---------- tela cheia + trava de rolagem da página ---------- */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) {
      root
        .requestFullscreen()
        .then(() => {
          enteredFullscreenRef.current = true;
        })
        .catch(() => {});
    }

    // Esc no modo tela cheia sai da tela cheia: fecha o modo palco junto
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && enteredFullscreenRef.current) close();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      enteredFullscreenRef.current = false;
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [close]);

  /* ---------- navegação entre músicas ---------- */
  const goTo = useCallback(
    (next) => {
      if (next < 0 || next >= total) return;
      setIndex(next);
      setScrolling(false);
      scrollerRef.current?.scrollTo({ top: 0 });
      showControls();
    },
    [total, showControls, setScrolling],
  );

  const scrollByPage = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ top: direction * el.clientHeight * 0.85, behavior: "smooth" });
  }, []);

  /* ---------- teclado (inclui pedais bluetooth, que enviam teclas) ---------- */
  useEffect(() => {
    function onKeyDown(e) {
      const handlers = {
        ArrowRight: () => multi && goTo(index + 1),
        ArrowLeft: () => multi && goTo(index - 1),
        PageDown: () => (setScrolling(false), scrollByPage(1)),
        PageUp: () => (setScrolling(false), scrollByPage(-1)),
        ArrowDown: () => (setScrolling(false), scrollerRef.current?.scrollBy({ top: 140, behavior: "smooth" })),
        ArrowUp: () => (setScrolling(false), scrollerRef.current?.scrollBy({ top: -140, behavior: "smooth" })),
        " ": toggleScroll,
        Escape: () => close(),
      };
      const handler = handlers[e.key];
      if (!handler) return;
      e.preventDefault();
      handler();
      showControls();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, multi, goTo, scrollByPage, close, showControls, setScrolling, toggleScroll]);

  /* ---------- deslizar o dedo pra trocar de música ---------- */
  function onTouchStart(e) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || !multi) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 2) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }
  }

  /* ---------- ajustes ---------- */
  const changeFont = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(MAX_FONT, Math.max(MIN_FONT, prev + delta));
      store("stage_fontSize", String(next));
      return next;
    });
    showControls();
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      store("stage_theme", next);
      return next;
    });
    showControls();
  };

  const changeTom = (delta) => {
    if (!song) return;
    onSemitonesChange?.(song.id, wrapSemitones(st + delta));
    showControls();
  };

  if (!song) return null;

  const prevSong = songs[index - 1];
  const nextSong = songs[index + 1];

  return createPortal(
    <Root
      $theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Modo palco"
      onPointerMove={showControls}
      onClick={showControls}
    >
      {metronome.isPlaying && <BeatDot $on={metronome.beatPulse} aria-hidden="true" />}

      <TopBar $visible={controlsVisible} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="icon close" onClick={close} aria-label="Sair do modo palco">
          <FiX size={22} />
        </button>

        <div className="title">
          <strong>{song.nome}</strong>
          {song.artista && <span>{song.artista}</span>}
        </div>

        {multi && (
          <span className="counter">
            {index + 1}/{total}
          </span>
        )}

        <Group aria-label="Tom">
          <button type="button" onClick={() => changeTom(-1)} aria-label="Descer meio tom">
            <FiMinus size={16} />
          </button>
          <span className="value" title="Tom atual">
            {currentKey ? `Tom ${currentKey}` : st === 0 ? "Tom" : `${st > 0 ? "+" : ""}${st}`}
          </span>
          <button type="button" onClick={() => changeTom(1)} aria-label="Subir meio tom">
            <FiPlus size={16} />
          </button>
        </Group>

        <Group aria-label="Tamanho do texto">
          <button type="button" onClick={() => changeFont(-2)} aria-label="Diminuir letra">
            A−
          </button>
          <button type="button" onClick={() => changeFont(2)} aria-label="Aumentar letra">
            A+
          </button>
        </Group>

        <Group aria-label="Rolagem automática">
          <button type="button" onClick={slower} aria-label="Rolagem mais lenta">
            <FiMinus size={16} />
          </button>
          <button
            type="button"
            className={scrolling ? "on" : ""}
            aria-pressed={scrolling}
            onClick={toggleScroll}
            aria-label={scrolling ? "Pausar rolagem" : "Iniciar rolagem"}
          >
            {scrolling ? <FiPause size={16} /> : <FiPlay size={16} />}
          </button>
          <button type="button" onClick={faster} aria-label="Rolagem mais rápida">
            <FiPlus size={16} />
          </button>
        </Group>

        <Group aria-label="Metrônomo">
          <button type="button" onClick={() => metronome.setBpm((b) => b - 5)} aria-label="Diminuir BPM">
            <FiMinus size={16} />
          </button>
          <button
            type="button"
            className={metronome.isPlaying ? "on" : ""}
            onClick={metronome.toggle}
            aria-label={metronome.isPlaying ? "Parar metrônomo" : "Ligar metrônomo"}
          >
            {metronome.bpm} BPM
          </button>
          <button type="button" onClick={() => metronome.setBpm((b) => b + 5)} aria-label="Aumentar BPM">
            <FiPlus size={16} />
          </button>
        </Group>

        <button
          type="button"
          className="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
        >
          {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </TopBar>

      <Scroller ref={scrollerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Page>
          <CifraRenderer segments={doc.segments} style={{ fontSize: `${fontSize}px` }} interactiveChords={false} />
        </Page>
      </Scroller>

      {multi && (
        <BottomBar $visible={controlsVisible} onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => goTo(index - 1)} disabled={!prevSong}>
            <FiChevronLeft size={20} />
            <span>{prevSong ? prevSong.nome : "—"}</span>
          </button>
          <button type="button" onClick={() => goTo(index + 1)} disabled={!nextSong} className="next">
            <span>{nextSong ? nextSong.nome : "Fim da playlist"}</span>
            <FiChevronRight size={20} />
          </button>
        </BottomBar>
      )}

      <Hint $visible={controlsVisible}>
        {multi ? "← → trocam de música · " : ""}PgDn/PgUp rolam · Espaço liga a rolagem · Esc sai
      </Hint>
    </Root>,
    document.body,
  );
}
