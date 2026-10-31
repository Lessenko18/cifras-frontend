import { FiPause, FiPlay } from "react-icons/fi";
import { Velocimetro } from "../VerPlaylistStyled";

// Barra de controles: rolagem automática, tamanho da letra e sumário.
export default function ControlesPlaylist({
  scrolling,
  onSlower,
  onFaster,
  onToggleScroll,
  onFontSize,
  sumarioVisivel,
  onToggleSumario,
}) {
  return (
    <Velocimetro>
      <button type="button" aria-label="Diminuir velocidade da rolagem" onClick={onSlower}>-</button>
      <button
        type="button"
        aria-label="Rolagem automática"
        aria-pressed={Boolean(scrolling)}
        onClick={onToggleScroll}
      >
        {scrolling ? <FiPause size={18} aria-hidden="true" /> : <FiPlay size={18} aria-hidden="true" />}
      </button>
      <button type="button" aria-label="Aumentar velocidade da rolagem" onClick={onFaster}>+</button>
      <span className="velocimetro-sep" />
      <button aria-label="Diminuir tamanho do texto" onClick={() => onFontSize(-2)}>A-</button>
      <button aria-label="Aumentar tamanho do texto" onClick={() => onFontSize(2)}>A+</button>
      <span className="velocimetro-sep" />
      <button aria-label="Sumário" onClick={onToggleSumario}>
        <img src={sumarioVisivel ? "/closeeye.svg" : "/openeye.svg"} alt="toggle sumario" />
      </button>
    </Velocimetro>
  );
}
