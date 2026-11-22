import { CifraContent, TomButton } from "../VerCifraStyled";
import { CifraRenderer } from "../../../components/CifraRenderer/CifraRenderer";
import CifraNota from "../../../components/CifraNota/CifraNota";

// Cifra em modo leitura: topo (tom, artista, link original) + letra em 1 ou 2 colunas.
export default function LeituraCifra({
  cifra,
  cifraId,
  doc,
  twoColumns,
  originalKey,
  currentKey,
  minor,
  capo = 0,
  formaKey,
  fontSize,
  controlesVisiveis,
  onOpenTom,
  onToggleControles,
}) {
  const style = { fontSize: `${fontSize}px` };

  return (
    <CifraContent className={twoColumns && "partes"}>
      <div className="cifra-topo">
        {originalKey && (
          <TomButton type="button" aria-label="Abrir seletor de tom" onClick={onOpenTom}>
            <span className="tom-label">Tom:</span>
            <span className="tom-value">{currentKey}{minor ? "m" : ""}</span>
          </TomButton>
        )}
        {capo > 0 && (
          <span
            className="capo-badge"
            title={formaKey ? `Formas de ${formaKey}${minor ? "m" : ""}, com capo na ${capo}ª casa` : undefined}
            style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--chord)", whiteSpace: "nowrap" }}
          >
            Capo {capo}ª{formaKey ? ` · formas de ${formaKey}${minor ? "m" : ""}` : ""}
          </span>
        )}
        {cifra.artista && (
          <p style={{ margin: 0, flex: 1, minWidth: 0, color: "var(--text-muted)", fontSize: "0.95rem", fontStyle: "italic" }}>
            {cifra.artista}
          </p>
        )}
        {/* Só http(s): links antigos com "javascript:" etc. não viram <a> */}
        {/^https?:\/\//i.test(cifra.link || "") && (
          <a target="_blank" rel="noopener noreferrer" href={cifra.link}>
            Acesse a cifra original
          </a>
        )}
        <button type="button" className="eye-toggle" aria-label="Mostrar/ocultar controles" onClick={onToggleControles}>
          <img src={controlesVisiveis ? "/closeeye.svg" : "/openeye.svg"} alt="toggle controles" />
        </button>
      </div>
      <CifraNota cifraId={cifraId} />
      {twoColumns ? (
        <div className="cifra-partes">
          <CifraRenderer segments={doc.columns[0]} style={style} />
          <span></span>
          <CifraRenderer segments={doc.columns[1]} style={style} />
        </div>
      ) : (
        <CifraRenderer segments={doc.segments} style={style} />
      )}
    </CifraContent>
  );
}
