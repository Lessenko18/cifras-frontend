import { ModalTom, Overlay } from "../../pages/VerCifra/VerCifraStyled";
import TomExtras from "../TomExtras/TomExtras";
import { NOTES_DISPLAY, getSemitonesTo, setAccidental } from "../../utils/transpose";

// Seletor de tom (cifra avulsa e playlist): grafia (sustenido/bemol), meio-tom e as 12 notas.
// `semitones` é o deslocamento atual e `onChange(n)` recebe o NOVO deslocamento absoluto.
export default function TomModal({ currentKey, accidental, semitones, onChange, onClose }) {
  return (
    <>
      <Overlay onClick={onClose} />
      <ModalTom>
        <div className="tom-titulo">
          Tom: <span>{currentKey}</span>
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
        <TomExtras currentKey={currentKey} />
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
