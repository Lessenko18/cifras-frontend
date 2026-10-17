import styled from "styled-components";

const TONES = {
  ok: "#22c55e",
  info: "var(--main)",
  danger: "#dc2626",
};

export const AuditContainer = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 0 auto 50px;
  padding: 0 16px;
  display: grid;
  gap: 12px;

  h1 {
    margin: 0 0 4px;
  }

  .sub {
    margin: 0;
    color: var(--text-muted);
  }
`;

export const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  select,
  input {
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-primary);
    font: inherit;
  }

  input {
    flex: 1;
    min-width: 220px;
  }
`;

export const Row = styled.article`
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-left: 4px solid ${({ $tone }) => TONES[$tone] || TONES.info};
  border-radius: 10px;
  padding: 12px 14px;
  display: grid;
  gap: 4px;

  .linha {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
    word-break: break-word;
  }

  .acao {
    color: var(--text-secondary);
  }

  .detalhes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
`;

export const Pager = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 8px;

  button {
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
