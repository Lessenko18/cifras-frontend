import { useState } from "react";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";
import { getAccidental, setAccidental } from "../../utils/transpose";

const KEY = "onboarding_v1";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2000;
`;

const Box = styled.div`
  position: fixed;
  z-index: 2001;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(420px, calc(100vw - 32px));
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  font-family: Inter, "Roboto", system-ui, sans-serif;

  h2 {
    margin: 0 0 4px;
  }
  .sub {
    margin: 0 0 16px;
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
  .opcoes button,
  .acoes button {
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
  .acoes {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .acoes .ok {
    background: var(--brand-gradient);
    color: #fff;
    border: none;
    font-weight: 700;
  }
`;

function alreadyDone() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // sem storage não dá para lembrar: melhor não importunar
  }
}

// Boas-vindas na primeira visita: instrumento, ♯/♭ e tema. Tudo pode ser
// mudado depois (diagrama de acordes, modal de tom e botão de tema).
export default function Onboarding() {
  const [open, setOpen] = useState(() => !alreadyDone());
  const { dark, toggle } = useTheme();
  const [instrumento, setInstrumento] = useState("guitar");
  const [acc, setAcc] = useState(getAccidental());

  if (!open) return null;

  function finish(save) {
    if (save) {
      try {
        localStorage.setItem("instrumento", instrumento);
      } catch {
        // sem storage: vale só nesta sessão
      }
      setAccidental(acc);
    }
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // sem storage: pode aparecer de novo na próxima visita
    }
    setOpen(false);
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
    <>
      <Overlay />
      <Box role="dialog" aria-modal="true" aria-label="Bem-vindo ao TL Cifras">
        <h2>Bem-vindo ao TL Cifras</h2>
        <p className="sub">Ajuste três preferências rápidas. Você pode mudar depois.</p>
        {group("Seu instrumento", instrumento, setInstrumento, [
          ["guitar", "Violão"],
          ["piano", "Teclado/Piano"],
        ])}
        {group("Notas com", acc, setAcc, [
          ["sharp", "Sustenido ♯"],
          ["flat", "Bemol ♭"],
        ])}
        {group("Tema", dark ? "dark" : "light", (v) => (v === "dark") !== dark && toggle(), [
          ["light", "Claro"],
          ["dark", "Escuro"],
        ])}
        <p className="sub">Dica: pressione “/” para buscar músicas e toque em um acorde para ver o diagrama.</p>
        <div className="acoes">
          <button type="button" onClick={() => finish(false)}>
            Agora não
          </button>
          <button type="button" className="ok" onClick={() => finish(true)}>
            Começar
          </button>
        </div>
      </Box>
    </>
  );
}
