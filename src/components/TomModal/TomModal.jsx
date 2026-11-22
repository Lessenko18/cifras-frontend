import { ModalTom, Overlay } from "../../pages/VerCifra/VerCifraStyled";
import TomExtras from "../TomExtras/TomExtras";
import { shapeSemitones, useCapo } from "../../utils/capoStorage";
import { NOTES_DISPLAY, getKeyAtOffset, getSemitonesTo, setAccidental } from "../../utils/transpose";

// Seletor de tom (cifra avulsa e playlist): grafia (sustenido/bemol), meio-tom e as 12 notas.
// `semitones` é o deslocamento atual e `onChange(n)` recebe o NOVO deslocamento absoluto.
export default function TomModal({ currentKey, originalKey, cifraId, minor = false, accidental, semitones, onChange, onClose }) {
  const suffix = minor ? "m" : "";
  const capo = useCapo(cifraId);
  const formaLabel =
    capo && originalKey ? getKeyAtOffset(originalKey, shapeSemitones(semitones, capo), accidental) + suffix : null;
  const originalLabel = originalKey ? getKeyAtOffset(originalKey, 0, accidental) + suffix : null;
  return (
    <>
      <Overlay onClick={onClose} />
      <ModalTom>
        <div className="tom-titulo">
          Tom: <span>{currentKey}{suffix}</span>
          {originalLabel && semitones !== 0 && (
            <small style={{ display: "block", fontSize: 12, fontWeight: 400, color: "var(--text-muted)" }}>
              Tom original: {originalLabel} · atual: {currentKey}{suffix}
            </small>
          )}
        </div>
        <div className="tom-semitom" role="group" aria-label="Grafia das notas">
          <button
            type="button"
            className={accidental === "sharp" ? "ativo" : ""}
            aria-pressed={accidental === "sharp"}
            onClick={() => setAccidental("sharp")}
          >
            Sustenido ♯
          </button>
          <button
            type="button"
            className={accidental === "flat" ? "ativo" : ""}
            aria-pressed={accidental === "flat"}
            onClick={() => setAccidental("flat")}
          >
            Bemol ♭
          </button>
        </div>
        <TomExtras currentKey={currentKey} minor={minor} cifraId={cifraId} capo={capo} formaLabel={formaLabel} />
        <div className="tom-semitom">
          <button type="button" onClick={() => onChange(semitones - 1)}>
            - ½ tom
          </button>
          <button type="button" onClick={() => onChange(semitones + 1)}>
            + ½ tom
          </button>
        </div>
        <div className="tom-grid">
          {NOTES_DISPLAY.map((note) => (
            <button
              key={note}
              type="button"
              className={getSemitonesTo(currentKey, note) === 0 ? "ativo" : ""}
              onClick={() => onChange(semitones + getSemitonesTo(currentKey, note))}
            >
              {note}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="tom-restaurar"
          onClick={() => {
            onChange(0);
            onClose();
          }}
        >
          Restaurar tom inicial
        </button>
      </ModalTom>
    </>
  );
}
