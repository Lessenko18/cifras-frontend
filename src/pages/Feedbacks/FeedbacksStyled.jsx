import styled from "styled-components";

export const FeedbacksContainer = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 0 auto 50px;
  padding: 0 16px;
  display: grid;
  gap: 16px;

  h1 {
    margin: 0 0 4px;
  }

  .sub,
  .vazio {
    margin: 0;
    color: var(--text-muted);
  }
`;

export const Filtros = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  button {
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
  }

  button.ativo {
    background: var(--main);
    border-color: var(--main);
    color: #fff;
  }
`;

export const FeedbackCard = styled.article`
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-left: 4px solid ${({ $lido }) => ($lido ? "#22c55e" : "var(--main)")};
  border-radius: 12px;
  padding: 16px;
  display: grid;
  gap: 8px;
  opacity: ${({ $lido }) => ($lido ? 0.75 : 1)};

  p {
    margin: 0;
  }

  .topo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tipo {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    background: var(--card-head-bg);
    color: var(--card-head-text);
  }

  .data,
  .autor {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .mensagem {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .acoes {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 4px;

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-primary);
      font-weight: 600;
      cursor: pointer;
    }

    .excluir {
      color: #dc2626;
    }
  }
`;
