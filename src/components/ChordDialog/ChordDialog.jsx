import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { chordNotes, chordPitchClasses, findChord } from "../../utils/chordLookup";
import { getAccidental } from "../../utils/transpose";
import { storage } from "../../lib/storage";
import { INSTRUMENTS, normalizeInstrument } from "../../utils/instruments";

// O banco de acordes é grande: só baixa quando alguém toca num acorde.
// A guitarra usa as mesmas formas do violão.
const loaders = {
  guitar: () => import("@tombatossals/chords-db/lib/guitar.json"),
};
const DATA_SOURCE = { guitar: "guitar", guitarra: "guitar" };

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const Box = styled.div`
  position: fixed;
  z-index: 1001;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(340px, calc(100vw - 32px));
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  text-align: center;
  white-space: normal;
  font-family: Inter, "Roboto", system-ui, sans-serif;

  h3 {
    margin: 0 0 10px;
    font-size: 1.3rem;
  }
  .tabs,
  .nav {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  button {
    border: 1px solid var(--border-color);
    background: var(--tom-btn-bg);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 8px 12px;
    min-height: 40px;
    cursor: pointer;
  }
  button.ativo {
    background: var(--tom-active-bg);
    color: var(--tom-active-text);
    border-color: var(--tom-active-bg);
  }
  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .vazio {
    color: var(--text-muted);
    padding: 24px 0;
  }
`;

// Teclado de 3 oitavas (C a B): teclas do acorde em destaque, com o nome da nota
function PianoDiagram({ voicing }) {
  const OCT = 3;
  const whiteW = 20;
  const H = 110;
  const keys = new Set(voicing.keys);
  const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
  const BLACK = [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]]; // [pc, índice da tecla branca à esquerda]
  const W = OCT * 7 * whiteW;
  const whites = [];
  for (let o = 0; o < OCT; o++) WHITE_PCS.forEach((pc, i) => whites.push({ idx: o * 12 + pc, x: (o * 7 + i) * whiteW }));
  const lit = "var(--tom-active-bg)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Teclado: ${voicing.label}`}>
      {whites.map((k) => (
        <g key={k.idx}>
          <rect x={k.x} y="0" width={whiteW} height={H} fill={keys.has(k.idx) ? lit : "#fff"} stroke="#333" strokeWidth="1" />
          {keys.has(k.idx) && (
            <text x={k.x + whiteW / 2} y={H - 8} fontSize="9" fontWeight="700" textAnchor="middle" fill="#fff">
              {voicing.names[k.idx]}
            </text>
          )}
        </g>
      ))}
      {Array.from({ length: OCT }, (_, o) =>
        BLACK.map(([pc, left]) => {
          const idx = o * 12 + pc;
          const x = (o * 7 + left) * whiteW + whiteW * 0.68;
          return (
            <g key={idx}>
              <rect x={x} y="0" width={whiteW * 0.64} height={H * 0.62} rx="2" fill={keys.has(idx) ? lit : "#222"} stroke="#000" strokeWidth="1" />
              {keys.has(idx) && (
                <text x={x + (whiteW * 0.64) / 2} y={H * 0.62 - 6} fontSize="7" fontWeight="700" textAnchor="middle" fill="#fff">
                  {voicing.names[idx]}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

// Baixo de 4 cordas (E A D G). Mostra as notas do acorde numa janela de 5 casas
// perto da nota que o baixista toca (fundamental ou a do "/"), que fica cheia.
const BASS_OPEN = [7, 2, 9, 4]; // G D A E, de cima para baixo no diagrama (G à esquerda)
function BassDiagram({ info, names }) {
  const strings = 4;
  const frets = 5;
  const W = 140;
  const H = 150;
  const left = 28;
  const top = 24;
  const right = W - 20;
  const gx = (right - left) / (strings - 1);
  const gy = (H - top - 12) / frets;
  const stroke = "var(--text-primary)";

  // casa da nota-guia: corda E; se ficar alta demais, usa a corda A
  const fretOnE = (info.bass - 4 + 12) % 12;
  const anchor = fretOnE <= 7 ? fretOnE : (info.bass - 9 + 12) % 12;
  const base = Math.max(1, anchor - 1);

  const dots = [];
  BASS_OPEN.forEach((open, s) => {
    for (let f = base === 1 ? 0 : base; f < base + frets; f++) {
      const pc = (open + f) % 12;
      if (info.pcs.includes(pc)) dots.push({ s, f, pc });
    }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Diagrama do baixo">
      {base > 1 && (
        <text x={4} y={top + gy / 2 + 4} fontSize="11" fill={stroke}>
          {base}
        </text>
      )}
      <line x1={left} x2={right} y1={top} y2={top} stroke={stroke} strokeWidth={base === 1 ? 4 : 1} />
      {Array.from({ length: frets }, (_, i) => (
        <line key={i} x1={left} x2={right} y1={top + (i + 1) * gy} y2={top + (i + 1) * gy} stroke={stroke} strokeWidth="1" opacity="0.6" />
      ))}
      {Array.from({ length: strings }, (_, i) => (
        <line key={i} x1={left + i * gx} x2={left + i * gx} y1={top} y2={top + frets * gy} stroke={stroke} strokeWidth="1" opacity="0.8" />
      ))}
      {dots.map(({ s, f, pc }) => {
        const x = left + s * gx;
        const isBass = pc === info.bass;
        const cy = f === 0 ? top - 11 : top + (f - base + 0.5) * gy;
        return (
          <g key={`${s}-${f}`}>
            <circle cx={x} cy={cy} r={f === 0 ? 4.5 : 7} fill={isBass ? "var(--tom-active-bg)" : "var(--bg)"} stroke="var(--tom-active-bg)" strokeWidth="1.5" />
            {f !== 0 && (
              <text x={x} y={cy + 3} fontSize="7" fontWeight="700" textAnchor="middle" fill={isBass ? "var(--tom-active-text)" : stroke}>
                {names[pc]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Diagram({ position, strings = 6, frets = 4 }) {
  const W = 140;
  const H = 150;
  const left = 24;
  const top = 24;
  const right = W - 16;
  const gx = (right - left) / (strings - 1);
  const gy = (H - top - 12) / frets;
  const stroke = "var(--text-primary)";
  const base = position.baseFret || 1;
  const barres = Array.isArray(position.barres) ? position.barres : [position.barres].filter(Boolean);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Diagrama do acorde">
      {base > 1 && (
        <text x={4} y={top + gy / 2 + 4} fontSize="11" fill={stroke}>
          {base}
        </text>
      )}
      <line x1={left} x2={right} y1={top} y2={top} stroke={stroke} strokeWidth={base === 1 ? 4 : 1} />
      {Array.from({ length: frets }, (_, i) => (
        <line key={i} x1={left} x2={right} y1={top + (i + 1) * gy} y2={top + (i + 1) * gy} stroke={stroke} strokeWidth="1" opacity="0.6" />
      ))}
      {Array.from({ length: strings }, (_, i) => (
        <line key={i} x1={left + i * gx} x2={left + i * gx} y1={top} y2={top + frets * gy} stroke={stroke} strokeWidth="1" opacity="0.8" />
      ))}
      {barres.map((f) => {
        const idxs = position.frets.map((v, i) => (v === f ? i : -1)).filter((i) => i >= 0);
        if (idxs.length < 2) return null;
        return (
          <rect
            key={f}
            x={left + idxs[0] * gx - 5}
            y={top + (f - 0.5) * gy - 5}
            width={(idxs[idxs.length - 1] - idxs[0]) * gx + 10}
            height="10"
            rx="5"
            fill="var(--tom-active-bg)"
          />
        );
      })}
      {position.frets.map((f, i) => {
        const x = left + i * gx;
        if (f === -1)
          return (
            <text key={i} x={x} y={top - 8} fontSize="11" textAnchor="middle" fill={stroke}>
              ×
            </text>
          );
        if (f === 0) return <circle key={i} cx={x} cy={top - 11} r="3.5" fill="none" stroke={stroke} />;
        return <circle key={i} cx={x} cy={top + (f - 0.5) * gy} r="6" fill="var(--tom-active-bg)" />;
      })}
    </svg>
  );
}

export default function ChordDialog({ chord, onClose }) {
  const [instrument, setInstrument] = useState(() => {
    try {
      return normalizeInstrument(storage.get("instrumento"));
    } catch {
      return "guitar";
    }
  });
  const [state, setState] = useState({ loading: true, found: null });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // teclado e baixo são calculados na hora; violão/guitarra baixam o banco de acordes
    const source = DATA_SOURCE[instrument];
    if (!source) {
      setIndex(0);
      return undefined;
    }
    let alive = true;
    loaders[source]()
      .then((mod) => {
        if (!alive) return;
        const data = mod.default ?? mod;
        setState({
          loading: false,
          found: findChord(data, source, chord),
          strings: data.main.strings,
          frets: data.main.fretsOnChord,
        });
        setIndex(0);
      })
      .catch(() => alive && setState({ loading: false, found: null }));
    return () => {
      alive = false;
    };
  }, [instrument, chord]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pick(next) {
    setState((s) => ({ ...s, loading: true }));
    setInstrument(next);
    try {
      storage.set("instrumento", next);
    } catch {
      // sem storage: vale só nesta sessão
    }
  }

  const piano = instrument === "piano" ? chordNotes(chord, getAccidental() === "flat") : null;
  const bassInfo = instrument === "baixo" ? chordPitchClasses(chord) : null;
  const bassNames = getAccidental() === "flat" ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const positions = state.found?.positions || [];
  const pos = positions[index];

  return createPortal(
    <>
      <Overlay onClick={onClose} />
      <Box role="dialog" aria-label={`Acorde ${chord}`}>
        <h3>{chord}</h3>
        <div className="tabs">
          {Object.entries(INSTRUMENTS).map(([k, label]) => (
            <button key={k} type="button" className={instrument === k ? "ativo" : ""} aria-pressed={instrument === k} onClick={() => pick(k)}>
              {label}
            </button>
          ))}
        </div>
        {instrument === "baixo" ? (
          bassInfo ? (
            <>
              <BassDiagram info={bassInfo} names={bassNames} />
              <p style={{ margin: "10px 0 12px", fontSize: 14 }}>
                <strong>Notas:</strong> {bassInfo.pcs.map((pc) => bassNames[pc]).join(" · ")}
                <br />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Bolinha cheia: nota base ({bassNames[bassInfo.bass]})</span>
              </p>
            </>
          ) : (
            <p className="vazio">Diagrama não disponível para este acorde.</p>
          )
        ) : instrument === "piano" ? (
          piano ? (
            <>
              <PianoDiagram voicing={piano.voicings[Math.min(index, piano.voicings.length - 1)]} />
              <p style={{ margin: "10px 0 6px", fontSize: 14 }}>
                <strong>Notas:</strong> {piano.notes.join(" · ")}
              </p>
              <div className="nav">
                <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Posição anterior">
                  ‹
                </button>
                <span style={{ alignSelf: "center", fontSize: 13 }}>
                  {piano.voicings[Math.min(index, piano.voicings.length - 1)].label}
                </span>
                <button type="button" disabled={index >= piano.voicings.length - 1} onClick={() => setIndex(index + 1)} aria-label="Próxima posição">
                  ›
                </button>
              </div>
            </>
          ) : (
            <p className="vazio">Diagrama não disponível para este acorde.</p>
          )
        ) : state.loading ? (
          <p className="vazio">Carregando…</p>
        ) : pos ? (
          <>
            <Diagram position={pos} strings={state.strings} frets={state.frets} />
            <div className="nav">
              <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Posição anterior">
                ‹
              </button>
              <span style={{ alignSelf: "center", fontSize: 13 }}>
                Posição {index + 1} / {positions.length}
              </span>
              <button type="button" disabled={index >= positions.length - 1} onClick={() => setIndex(index + 1)} aria-label="Próxima posição">
                ›
              </button>
            </div>
          </>
        ) : (
          <p className="vazio">Diagrama não disponível para este acorde.</p>
        )}
        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </Box>
    </>,
    document.body,
  );
}
