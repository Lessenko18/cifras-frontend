import styled from "styled-components";

export const Painel = styled.div`
  background: var(--light);
  width: 760px;
  max-width: calc(100% - 24px);
  max-height: 88vh;
  overflow-y: auto;
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 400;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 14px;

  h3 {
    font-size: 20px;
    font-weight: 800;
    margin-right: 28px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.92rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }
`;

export const Avisos = styled.ul`
  margin: 0;
  padding: 10px 12px 10px 28px;
  border-radius: 8px;
  background: #fef3c7;
  color: #78350f;
  font-size: 0.88rem;
  display: grid;
  gap: 4px;
`;

export const Cartao = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 10px;
  opacity: ${(p) => (p.$off ? 0.6 : 1)};

  .topo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .topo input[type="checkbox"] {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .campos {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  label {
    display: grid;
    gap: 4px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  input[type="text"],
  select,
  textarea {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 7px 9px;
    font-size: 0.92rem;
    background: var(--bg-input);
    color: var(--text-primary);
  }

  textarea {
    font-family: monospace;
    min-height: 220px;
    resize: vertical;
    white-space: pre;
  }

  summary {
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  details > div {
    display: grid;
    gap: 10px;
    margin-top: 8px;
  }

  .selo {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--bg-input);
    color: var(--text-muted);
  }

  .selo.alerta {
    background: #fef3c7;
    color: #78350f;
  }
`;
