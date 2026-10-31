import { CifraRenderer } from "../../../components/CifraRenderer/CifraRenderer";
import { CifraCard, TituloMusica } from "../VerPlaylistStyled";
import { TomButton } from "../../VerCifra/VerCifraStyled";

// Uma música da playlist: título, ações (PDF, controles, tom) e a cifra transposta.
export default function MusicaCard({
  index,
  music,
  originalKey,
  currentKey,
  doc,
  fontSize,
  controlesVisiveis,
  onExportPdf,
  onToggleControles,
  onOpenTom,
}) {
  return (
    <CifraCard id={`musica-${index}`}>
      <div className="card-header">
        <TituloMusica>{music.nome}</TituloMusica>
        <div className="card-actions">
          <button
            className="eye-toggle"
            type="button"
            aria-label={`Exportar "${music.nome}" em PDF`}
            title="Exportar cifra em PDF"
            onClick={onExportPdf}
          >
            <img src="/pdf.svg" alt="Exportar PDF" />
          </button>
          <button
            className="eye-toggle"
            type="button"
            aria-label="Mostrar/ocultar controles"
            onClick={onToggleControles}
          >
            <img src={controlesVisiveis ? "/closeeye.svg" : "/openeye.svg"} alt="toggle controles" />
          </button>
          {originalKey && (
            <TomButton type="button" aria-label="Abrir seletor de tom" onClick={onOpenTom}>
              <span className="tom-label">Tom:</span>
              <span className="tom-value">{currentKey}</span>
            </TomButton>
          )}
        </div>
      </div>
      <CifraRenderer segments={doc.segments} style={{ fontSize: `${fontSize}px` }} />
    </CifraCard>
  );
}
