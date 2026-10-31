import { useEffect, useState } from "react";
import { FiPause, FiPlay, FiSave } from "react-icons/fi";
import { Velocimetro } from "../../VerPlaylist/VerPlaylistStyled";

// Barra de controles de leitura: rolagem automática, tamanho da letra e metrônomo.
export default function ControlesLeitura({
  scrolling,
  onToggleScroll,
  onSlower,
  onFaster,
  onFontSize,
  metronome,
  canSaveBpm,
  onSaveBpm,
  onHide,
}) {
  const [editingBpm, setEditingBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState("90");

  // Mantém o campo de digitação do BPM sincronizado enquanto não está em edição
  useEffect(() => {
    if (!editingBpm) setBpmInput(String(metronome.bpm));
  }, [metronome.bpm, editingBpm]);

  function commitBpmInput() {
    const n = parseInt(bpmInput, 10);
    if (!Number.isNaN(n)) metronome.setBpm(n);
    setEditingBpm(false);
  }

  return (
    <Velocimetro>
      <button type="button" aria-label="Diminuir velocidade da rolagem" onClick={onSlower}>
        -
      </button>
      <button
        type="button"
        aria-label="Rolagem automática"
        aria-pressed={Boolean(scrolling)}
        onClick={onToggleScroll}
      >
        {scrolling ? <FiPause size={18} aria-hidden="true" /> : <FiPlay size={18} aria-hidden="true" />}
      </button>
      <button type="button" aria-label="Aumentar velocidade da rolagem" onClick={onFaster}>
        +
      </button>
      <span className="velocimetro-sep" />
      <button type="button" aria-label="Diminuir tamanho do texto" onClick={() => onFontSize(-2)}>
        A-
      </button>
      <button type="button" aria-label="Aumentar tamanho do texto" onClick={() => onFontSize(2)}>
        A+
      </button>
      <span className="velocimetro-sep" />

      <div className="metronomo">
        <button type="button" aria-label="Diminuir BPM" onClick={() => metronome.setBpm((b) => b - 1)}>
          -
        </button>
        {editingBpm ? (
          <input
            type="number"
            className="bpm-input"
            autoFocus
            min={30}
            max={300}
            value={bpmInput}
            aria-label="Digitar BPM"
            onChange={(e) => setBpmInput(e.target.value)}
            onBlur={commitBpmInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitBpmInput(); }
              if (e.key === "Escape") { setBpmInput(String(metronome.bpm)); setEditingBpm(false); }
            }}
          />
        ) : (
          <span
            className="bpm-value"
            title="Batidas por minuto (duplo clique para digitar)"
            onDoubleClick={() => setEditingBpm(true)}
          >
            {metronome.bpm}
          </span>
        )}
        <button type="button" aria-label="Aumentar BPM" onClick={() => metronome.setBpm((b) => b + 1)}>
          +
        </button>
        <button
          type="button"
          className={`metronomo-play${metronome.isPlaying ? " playing" : ""}`}
          aria-label={metronome.isPlaying ? "Parar metrônomo" : "Iniciar metrônomo"}
          aria-pressed={metronome.isPlaying}
          onClick={metronome.toggle}
        >
          {metronome.isPlaying ? (metronome.beatPulse ? "●" : "○") : "♩"}
        </button>
        {canSaveBpm && (
          <button
            type="button"
            className="metronomo-save"
            aria-label="Salvar este BPM na cifra"
            title="Salvar BPM na cifra"
            onClick={onSaveBpm}
          >
            <FiSave size={16} />
          </button>
        )}
      </div>

      <span className="velocimetro-sep" />
      <button type="button" className="eye-toggle" aria-label="Ocultar controles" onClick={onHide}>
        <img src="/closeeye.svg" alt="ocultar controles" />
      </button>
    </Velocimetro>
  );
}
