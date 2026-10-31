import { useCallback, useEffect, useRef, useState } from "react";

// Velocidades em pixels por segundo, da mais lenta (nível 0) à mais rápida.
export const SCROLL_SPEEDS = [6, 8, 10, 13, 17, 23, 32, 45, 66];
const DEFAULT_LEVEL = 3;
const END_MARGIN_PX = 2;
// Se a aba ficou em segundo plano o relógio "pula"; limitar evita um salto na volta.
const MAX_FRAME_SECONDS = 0.1;
const NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

const isEditable = (el) => el?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName || "");

// Rolagem automática (botão play/pause de cifras, playlists e modo palco).
// - Rola a página, ou o elemento devolvido por `getScroller` (ex.: o modo palco).
// - Anda em px/s com acumulador fracionário: suave e igual em qualquer zoom/tela.
// - Pausa ao chegar no fim e quando a pessoa rola por conta própria (roda do mouse,
//   arrastar o dedo ou setas/PageUp/PageDown). `pauseOnKeys: false` deixa as teclas
//   com quem usa o hook (o modo palco trata as dele).
export function useAutoScroll({ getScroller, pauseOnKeys = true } = {}) {
  const [scrolling, setScrolling] = useState(false);
  const [level, setLevel] = useState(DEFAULT_LEVEL);

  // Sempre a versão mais recente, sem reiniciar a animação a cada render
  const getScrollerRef = useRef(getScroller);
  getScrollerRef.current = getScroller;

  useEffect(() => {
    if (!scrolling) return undefined;

    const pxPerSecond = SCROLL_SPEEDS[level];
    let frame = 0;
    let last = null;
    let carry = 0;

    const stop = () => setScrolling(false);

    const tick = (now) => {
      const el = getScrollerRef.current?.() ?? null;
      const position = el ? el.scrollTop : window.scrollY;
      const max = el
        ? el.scrollHeight - el.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      if (position >= max - END_MARGIN_PX) {
        stop();
        return;
      }

      if (last !== null) carry += pxPerSecond * Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;

      const whole = Math.floor(carry);
      if (whole >= 1) {
        carry -= whole;
        if (el) el.scrollTop += whole;
        else window.scrollBy(0, whole);
      }
      frame = requestAnimationFrame(tick);
    };

    const onKey = (e) => {
      if (NAV_KEYS.has(e.key) && !isEditable(e.target)) stop();
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    if (pauseOnKeys) window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [scrolling, level, pauseOnKeys]);

  const toggle = useCallback(() => setScrolling((s) => !s), []);
  const slower = useCallback(() => setLevel((l) => Math.max(0, l - 1)), []);
  const faster = useCallback(() => setLevel((l) => Math.min(SCROLL_SPEEDS.length - 1, l + 1)), []);

  return { scrolling, setScrolling, toggle, level, slower, faster };
}
