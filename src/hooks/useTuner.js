import { useCallback, useEffect, useRef, useState } from "react";

export const NOTE_NAMES = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];
const FFT_SIZE = 2048;
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

// ACF2+: autocorrelação com interpolação parabólica pro pico, e recorte das
// bordas de baixa amplitude pra reduzir ruído na estimativa do período.
function autoCorrelate(buffer, sampleRate) {
  const SIZE = buffer.length;

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < RMS_THRESHOLD) return -1;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buffer.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return -1;

  const c = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i];
    }
  }

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  if (maxpos <= 0) return -1;

  // c[0] é a energia total do sinal (autocorrelação em lag 0); ruído de
  // banda larga (ar-condicionado, ventilador) não forma um pico bem definido
  // em nenhum outro lag, então essa razão fica baixa e a leitura é descartada
  if (c[0] <= 0 || maxval / c[0] < CLARITY_THRESHOLD) return -1;

  let T0 = maxpos;
  const x1 = c[T0 - 1] ?? c[T0];
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? c[T0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

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
