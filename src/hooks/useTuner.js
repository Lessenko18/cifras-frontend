import { useCallback, useEffect, useRef, useState } from "react";

export const NOTE_NAMES = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];
const FFT_SIZE = 4096; // janela longa o bastante pra vários ciclos do Mi grave (~82 Hz)
const MIN_FREQ = 60; // cobre afinações baixas (ex.: drop D, 73 Hz)
const MAX_FREQ = 1500;
const PEAK_PICK_RATIO = 0.9; // aceita o 1º pico com ≥90% do maior — evita erro de oitava
const RMS_THRESHOLD = 0.025; // ignora silêncio e ruído de fundo baixo (ex.: ar-condicionado)
const CLARITY_THRESHOLD = 0.85; // exige um pico de periodicidade bem definido pra aceitar a leitura
const STABLE_FRAMES = 2; // nº de leituras seguidas concordando antes de atualizar a nota exibida

export function noteFromMidi(midi) {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { name, octave };
}

// Afinador cromático via Web Audio API — captura o microfone e detecta a
// frequência fundamental por autocorrelação (algoritmo ACF2+, clássico de
// pitch-detection: https://github.com/cwilso/PitchDetect).
export function useTuner() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [pitch, setPitch] = useState(null);
  const [note, setNote] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceIdState] = useState("");

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const bufferRef = useRef(null);
  const frameSkipRef = useRef(0);
  const deviceIdRef = useRef("");
  const lastMidiRef = useRef(null);
  const stableCountRef = useRef(0);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === "audioinput"));
    } catch {
      // sem permissão ainda: segue sem listar rótulos
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    lastMidiRef.current = null;
    stableCountRef.current = 0;
    setListening(false);
    setPitch(null);
    setNote(null);
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !ctx) return;

    // roda a autocorrelação a ~30fps: é suficiente pra UI e mais leve pra CPU
    frameSkipRef.current = (frameSkipRef.current + 1) % 2;
    if (frameSkipRef.current === 0) {
      analyser.getFloatTimeDomainData(bufferRef.current);
      const freq = autoCorrelate(bufferRef.current, ctx.sampleRate);

      if (freq > 0) {
        const midi = noteFromPitch(freq);

        // exige a mesma nota em leituras consecutivas antes de exibir —
        // evita o "afinador maluco" quando ruído de fundo (ar-condicionado,
        // ventilador) gera um pico periódico isolado
        if (midi === lastMidiRef.current) {
          stableCountRef.current += 1;
        } else {
          lastMidiRef.current = midi;
          stableCountRef.current = 1;
        }

        if (stableCountRef.current >= STABLE_FRAMES) {
          const { name, octave } = noteFromMidi(midi);
          const cents = centsOffFromPitch(freq, midi);
          setPitch(freq);
          setNote({ name, octave, cents, midi });
        }
      } else {
        lastMidiRef.current = null;
        stableCountRef.current = 0;
        setPitch(null);
        setNote(null);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Seu navegador não suporta acesso ao microfone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceIdRef.current ? { exact: deviceIdRef.current } : undefined,
          echoCancellation: false,
          // ligado pra filtrar ruído estacionário de fundo (ar-condicionado, ventilador)
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      setListening(true);
      tick();
      refreshDevices(); // agora com permissão concedida, os rótulos ficam disponíveis
    } catch (err) {
      setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  }, [tick, refreshDevices]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  const setDeviceId = useCallback(
    (id) => {
      deviceIdRef.current = id;
      setDeviceIdState(id);
      if (streamRef.current) {
        // já estava ouvindo: reinicia a captura no dispositivo escolhido
        stop();
        start();
      }
    },
    [start, stop],
  );

  useEffect(() => {
    refreshDevices();
    if (!navigator.mediaDevices?.addEventListener) return;
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
    return () => navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
  }, [refreshDevices]);

  useEffect(() => stop, [stop]);

  return { listening, error, pitch, note, devices, deviceId, setDeviceId, start, stop, toggle };
}

// Autocorrelação normalizada (NSDF, método de McLeod) com interpolação
// parabólica pro pico. A normalização por lag é essencial pras notas graves:
// na autocorrelação crua, quanto maior o período, menos amostras se sobrepõem
// e o pico "encolhe" — Mi/Lá/Ré graves nunca passavam no limiar de clareza.
function autoCorrelate(buffer, sampleRate) {
  const n = buffer.length;

  let rms = 0;
  for (let i = 0; i < n; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / n);
  if (rms < RMS_THRESHOLD) return -1;

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ));
  const maxLag = Math.min(n - 2, Math.ceil(sampleRate / MIN_FREQ));

  // nsdf[lag] = 2·Σ x[j]·x[j+lag] / Σ (x[j]² + x[j+lag]²), sempre em [-1, 1]
  const nsdf = new Float32Array(maxLag + 2);
  let m = 0;
  for (let j = 0; j < n; j++) m += 2 * buffer[j] * buffer[j];
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    if (lag > 0) m -= buffer[lag - 1] * buffer[lag - 1] + buffer[n - lag] * buffer[n - lag];
    let acf = 0;
    for (let j = 0; j < n - lag; j++) acf += buffer[j] * buffer[j + lag];
    nsdf[lag] = m > 0 ? (2 * acf) / m : 0;
  }

  // pula o lóbulo inicial (lag ~0) até a primeira passagem por zero
  let lag = 1;
  while (lag <= maxLag && nsdf[lag] > 0) lag++;
  if (lag > maxLag) return -1;

  // coleta os máximos locais positivos dentro da faixa de frequências válida
  const peaks = [];
  let globalMax = 0;
  for (lag = Math.max(lag, minLag); lag <= maxLag; lag++) {
    const v = nsdf[lag];
    if (v > 0 && v > nsdf[lag - 1] && v >= nsdf[lag + 1]) {
      peaks.push(lag);
      if (v > globalMax) globalMax = v;
    }
  }
  if (!peaks.length) return -1;

  // primeiro pico próximo do máximo global: evita erro de oitava abaixo
  const T = peaks.find((p) => nsdf[p] >= PEAK_PICK_RATIO * globalMax);

  // ruído de banda larga (ar-condicionado, ventilador) não forma um pico
  // bem definido em nenhum lag, então a clareza fica baixa e é descartado
  if (nsdf[T] < CLARITY_THRESHOLD) return -1;

  let T0 = T;
  const x1 = nsdf[T - 1];
  const x2 = nsdf[T];
  const x3 = nsdf[T + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T - b / (2 * a);

  if (T0 <= 0) return -1;
  return sampleRate / T0;
}

function noteFromPitch(frequency) {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
  return Math.floor((1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2));
}
