import styled from "styled-components";

export const AjudaContainer = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 0 auto 50px;
  padding: 0 16px;
  display: grid;
  gap: 32px;

  h1 {
    margin: 0 0 6px;
  }

  .sub {
    margin: 0;
    color: var(--text-muted);
  }
`;

export const Bloco = styled.div`
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 20px;

  h2 {
    margin: 0 0 14px;
    font-size: 1.2rem;
  }
`;

export const FaqList = styled.div`
  display: grid;
  gap: 10px;

  details {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 0 16px;
  }

  summary {
    cursor: pointer;
    font-weight: 700;
    padding: 14px 0;
    list-style: none;
    display: flex;
    justify-content: space-between;
    gap: 12px;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: "+";
      color: var(--main);
      font-size: 1.3rem;
      line-height: 1;
    }
  }

  details[open] summary::after {
    content: "–";
  }

  ol {
    margin: 0 0 12px;
    padding-left: 20px;
    display: grid;
    gap: 6px;
    color: var(--text-secondary);
  }

  .nota {
    margin: 0 0 14px;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
`;

export const FeedbackForm = styled.form`
  display: grid;
  gap: 14px;

  label {
    display: grid;
    gap: 6px;
    font-weight: 600;
    font-size: 0.92rem;
  }

  .hp-field {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .opcional {
    font-weight: 400;
    color: var(--text-muted);
  }

  select,
  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-primary);
    font: inherit;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  .contador {
    justify-self: end;
    font-size: 0.78rem;
    font-weight: 400;
    color: var(--text-muted);
  }

  button[type="submit"] {
    justify-self: start;
  }

  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
