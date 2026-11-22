import { useState } from "react";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";
import { getAccidental, setAccidental } from "../../utils/transpose";
import { storage } from "../../lib/storage";
import { INSTRUMENT_OPTIONS, parseInstruments } from "../../utils/instruments";

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

function lerInstrumentos() {
  return parseInstruments(storage.get("instrumento"));
}

// Mesmas preferências da tela de boas-vindas, para a pessoa poder mudar
// quando quiser. Cada escolha é aplicada na hora.
export default function PreferenciasPerfil() {
  const { dark, toggle } = useTheme();
  const [instrumentos, setInstrumentos] = useState(lerInstrumentos);
  const [acc, setAcc] = useState(getAccidental());

  // Seleção múltipla: clicar alterna o instrumento (sempre fica ao menos um).
  function escolherInstrumento(v) {
    const next = instrumentos.includes(v) ? instrumentos.filter((i) => i !== v) : [...instrumentos, v];
    if (!next.length) return;
    setInstrumentos(next);
    storage.set("instrumento", next.join(","));
  }

  function escolherAcidente(v) {
    setAcc(v);
    setAccidental(v);
  }

  const group = (legend, value, set, items) => {
    const isOn = (v) => (Array.isArray(value) ? value.includes(v) : value === v);
    return (
      <fieldset>
        <legend>{legend}</legend>
        <div className="opcoes">
          {items.map(([v, label]) => (
            <button key={v} type="button" className={isOn(v) ? "ativo" : ""} aria-pressed={isOn(v)} onClick={() => set(v)}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
    );
  };

  return (
    <Wrap aria-label="Preferências">
      <h3>Preferências</h3>
      <p className="sub">Ajustes salvos neste aparelho. Valem na hora.</p>
      {group("Seus instrumentos", instrumentos, escolherInstrumento, INSTRUMENT_OPTIONS)}
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
