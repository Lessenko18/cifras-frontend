import { useEffect, useState } from "react";
import styled from "styled-components";
import { FiEdit3 } from "react-icons/fi";

const Box = styled.div`
  width: 100%;
  font-family: Inter, "Roboto", system-ui, sans-serif;

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px dashed var(--border-color);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.85rem;
  }
  .nota {
    display: block;
    width: 100%;
    min-height: 72px;
    margin-top: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e6c84a;
    background: #fff6c8;
    color: #3b3300;
    font: inherit;
    resize: vertical;
  }
  .dica {
    margin: 4px 0 0;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

const key = (id) => `nota_${id}`;

function read(id) {
  try {
    return localStorage.getItem(key(id)) || "";
  } catch {
    return "";
  }
}

// Anotação pessoal da cifra ("entra depois que o padre falar…"). Fica só neste
// aparelho: não vai para o servidor nem aparece para outros usuários.
export default function CifraNota({ cifraId }) {
  const [text, setText] = useState(() => read(cifraId));
  const [open, setOpen] = useState(() => read(cifraId) !== "");

  useEffect(() => {
    const saved = read(cifraId);
    setText(saved);
    setOpen(saved !== "");
  }, [cifraId]);

  function change(value) {
    const next = value.slice(0, 1000);
    setText(next);
    try {
      if (next.trim()) localStorage.setItem(key(cifraId), next);
      else localStorage.removeItem(key(cifraId));
    } catch {
      // sem storage: a nota vale só até sair da página
    }
  }

  return (
    <Box>
      {!open ? (
        <button type="button" className="toggle" onClick={() => setOpen(true)}>
          <FiEdit3 aria-hidden="true" /> Minha anotação
        </button>
      ) : (
        <>
          <textarea
            className="nota"
            value={text}
            onChange={(e) => change(e.target.value)}
            placeholder="Anotação pessoal (ex.: repetir refrão 2×)"
            aria-label="Minha anotação sobre esta cifra"
            maxLength={1000}
          />
          <p className="dica">Salva só neste aparelho; só você vê.</p>
        </>
      )}
    </Box>
  );
}
