import { useState } from "react";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";
import { getAccidental, setAccidental } from "../../utils/transpose";
import { storage } from "../../lib/storage";
import { INSTRUMENT_OPTIONS, normalizeInstrument } from "../../utils/instruments";

const Wrap = styled.section`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-primary);

  h3 {
    margin: 0 0 4px;
  }
  .sub {
    margin: 0 0 14px;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  fieldset {
    border: none;
    margin: 0 0 14px;
    padding: 0;
  }
  legend {
    font-weight: 700;
    margin-bottom: 6px;
  }
  .opcoes {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .opcoes button {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--tom-btn-bg);
    color: var(--text-primary);
    cursor: pointer;
  }
  .opcoes button.ativo {
    background: var(--tom-active-bg);
    color: var(--tom-active-text);
    border-color: var(--tom-active-bg);
  }
`;

function lerInstrumento() {
  try {
    return normalizeInstrument(storage.get("instrumento"));
  } catch {
    return "guitar";
  }
}

// Mesmas preferências da tela de boas-vindas, para a pessoa poder mudar
// quando quiser. Cada escolha é aplicada na hora.
export default function PreferenciasPerfil() {
  const { dark, toggle } = useTheme();
  const [instrumento, setInstrumento] = useState(lerInstrumento);
  const [acc, setAcc] = useState(getAccidental());

  function escolherInstrumento(v) {
    setInstrumento(v);
    try {
      storage.set("instrumento", v);
    } catch {
      // sem storage: vale só nesta sessão
    }
  }

  function escolherAcidente(v) {
    setAcc(v);
    setAccidental(v);
  }

  const group = (legend, value, set, items) => (
    <fieldset>
      <legend>{legend}</legend>
      <div className="opcoes">
        {items.map(([v, label]) => (
          <button key={v} type="button" className={value === v ? "ativo" : ""} aria-pressed={value === v} onClick={() => set(v)}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <Wrap aria-label="Preferências">
      <h3>Preferências</h3>
      <p className="sub">Ajustes salvos neste aparelho. Valem na hora.</p>
      {group("Seu instrumento", instrumento, escolherInstrumento, INSTRUMENT_OPTIONS)}
      {group("Notas com", acc, escolherAcidente, [
        ["sharp", "Sustenido ♯"],
        ["flat", "Bemol ♭"],
      ])}
      {group("Tema", dark ? "dark" : "light", (v) => (v === "dark") !== dark && toggle(), [
        ["light", "Claro"],
        ["dark", "Escuro"],
      ])}
    </Wrap>
  );
}
