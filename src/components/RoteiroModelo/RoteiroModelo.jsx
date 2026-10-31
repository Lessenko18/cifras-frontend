import { useState } from "react";
import styled from "styled-components";
import { useCategorias } from "../../hooks/queries/useCategorias";
import { getCifrasService } from "../../service/cifraService";

// Modelos de repertório por momento litúrgico. Cada momento é casado com uma
// categoria de mesmo nome (sem diferenciar acento/caixa) para sugerir cifras.
const MODELOS = {
  Missa: [
    "Entrada",
    "Ato Penitencial",
    "Glória",
    "Salmo",
    "Aclamação",
    "Ofertório",
    "Santo",
    "Cordeiro",
    "Comunhão",
    "Pós-Comunhão",
    "Final",
  ],
  Casamento: ["Entrada", "Ato Penitencial", "Ofertório", "Comunhão", "Final"],
  Retiro: ["Entrada", "Adoração", "Comunhão", "Final"],
};

const normalize = (t = "") =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .modelos {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .modelos button {
    min-height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    background: var(--tom-btn-bg);
    color: var(--text-primary);
    cursor: pointer;
  }
  .modelos button.ativo {
    background: var(--tom-active-bg);
    color: var(--tom-active-text);
    border-color: var(--tom-active-bg);
  }
  .momento {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }
  .momento select {
    min-width: 0;
    min-height: 36px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-primary);
  }
  .sem-cat {
    color: var(--text-muted);
    font-size: 0.8rem;
  }
`;

function Momento({ nome, categoria, escolhidos, addItem }) {
  const [opcoes, setOpcoes] = useState(null);

  async function carregar() {
    if (opcoes || !categoria) return;
    try {
      const res = await getCifrasService({ categorias: [categoria._id], limit: 50 });
      setOpcoes(res.data?.cifras || []);
    } catch {
      setOpcoes([]);
    }
  }

  return (
    <div className="momento">
      <label>{nome}</label>
      {categoria ? (
        <select
          value=""
          aria-label={`Escolher música para ${nome}`}
          onFocus={carregar}
          onMouseDown={carregar}
          onChange={(e) => {
            const item = (opcoes || []).find((c) => c._id === e.target.value);
            if (item && !escolhidos.some((c) => (c._id || c.id) === item._id)) addItem([...escolhidos, item]);
          }}
        >
          <option value="">{opcoes === null ? "Escolher…" : opcoes.length ? "Escolher…" : "Sem músicas"}</option>
          {(opcoes || [])
            .filter((c) => !escolhidos.some((e) => (e._id || e.id) === c._id))
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.nome}
                {c.artista ? ` — ${c.artista}` : ""}
              </option>
            ))}
        </select>
      ) : (
        <span className="sem-cat">sem categoria “{nome}” cadastrada</span>
      )}
    </div>
  );
}

// Escolhe um modelo (Missa, Casamento, Retiro), preenche o nome sugerido e lista
// os momentos com sugestão de cifras da categoria correspondente.
export default function RoteiroModelo({ escolhidos, addItem, nomeInputId }) {
  const [modelo, setModelo] = useState(null);
  const { categorias } = useCategorias();

  function escolher(nome) {
    const next = modelo === nome ? null : nome;
    setModelo(next);
    const input = nomeInputId && document.getElementById(nomeInputId);
    if (next && input && !input.value.trim()) {
      const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      input.value = `${next} ${hoje}`;
    }
  }

  return (
    <Box>
      <label>Modelo de repertório (opcional)</label>
      <div className="modelos">
        {Object.keys(MODELOS).map((nome) => (
          <button key={nome} type="button" className={modelo === nome ? "ativo" : ""} aria-pressed={modelo === nome} onClick={() => escolher(nome)}>
            {nome}
          </button>
        ))}
      </div>
      {modelo &&
        MODELOS[modelo].map((momento) => (
          <Momento
            key={`${modelo}-${momento}`}
            nome={momento}
            categoria={categorias.find((c) => normalize(c.nome) === normalize(momento))}
            escolhidos={escolhidos}
            addItem={addItem}
          />
        ))}
    </Box>
  );
}
