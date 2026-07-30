import { useCallback, useEffect, useRef, useState } from "react";

const LOOKAHEAD_MS = 25; // frequência com que o scheduler roda
const SCHEDULE_AHEAD_S = 0.1; // quanto tempo à frente agendar os cliques
const MIN_BPM = 30;
const MAX_BPM = 300;

// Metrônomo via Web Audio API com lookahead scheduling — evita o jitter do setInterval puro.
// Referência: "A Tale of Two Clocks" (Chris Wilson / Web Audio team).
export function useMetronome(initialBpm = 90) {
  const [bpm, setBpmState] = useState(() => clamp(initialBpm));
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);

  const audioCtxRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef(null);
  const bpmRef = useRef(bpm);
  const pulseTimeoutsRef = useRef([]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const setBpm = useCallback((value) => {
    setBpmState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return clamp(next);
    });
  }, []);

  const scheduleClick = useCallback((time) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(1, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);

    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
    const onId = setTimeout(() => setBeatPulse(true), delayMs);
    const offId = setTimeout(() => setBeatPulse(false), delayMs + 90);
    pulseTimeoutsRef.current.push(onId, offId);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleClick(nextNoteTimeRef.current);
      nextNoteTimeRef.current += 60 / bpmRef.current;
    }
    timerIdRef.current = setTimeout(scheduler, LOOKAHEAD_MS);
  }, [scheduleClick]);

  const clearPulseTimeouts = useCallback(() => {
    pulseTimeoutsRef.current.forEach(clearTimeout);
    pulseTimeoutsRef.current = [];
  }, []);

  const stop = useCallback(() => {
    clearTimeout(timerIdRef.current);
    timerIdRef.current = null;
    clearPulseTimeouts();
    setIsPlaying(false);
    setBeatPulse(false);
  }, [clearPulseTimeouts]);

  const start = useCallback(() => {
    if (timerIdRef.current) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();

    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    setIsPlaying(true);
    scheduler();
  }, [scheduler]);

  const toggle = useCallback(() => {
    if (timerIdRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    return () => {
      clearTimeout(timerIdRef.current);
      clearPulseTimeouts();
      audioCtxRef.current?.close();
    };
  }, [clearPulseTimeouts]);

  return { bpm, setBpm, isPlaying, beatPulse, start, stop, toggle };
}

function clamp(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return MIN_BPM;
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(n)));
}
