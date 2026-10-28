import styled from "styled-components";

const THEMES = {
  dark: {
    bg: "#000000",
    fg: "#f5f5f5",
    muted: "#a3a3a3",
    chord: "#fbbf24",
    bar: "rgba(24, 24, 27, 0.94)",
    barBorder: "rgba(255, 255, 255, 0.12)",
    btn: "rgba(255, 255, 255, 0.1)",
    btnHover: "rgba(255, 255, 255, 0.2)",
  },
  light: {
    bg: "#ffffff",
    fg: "#111111",
    muted: "#4b5563",
    chord: "#4338ca",
    bar: "rgba(244, 244, 245, 0.96)",
    barBorder: "rgba(0, 0, 0, 0.12)",
    btn: "rgba(0, 0, 0, 0.07)",
    btnHover: "rgba(0, 0, 0, 0.14)",
  },
};

export const Root = styled.div`
  --st-bg: ${({ $theme }) => THEMES[$theme].bg};
  --st-fg: ${({ $theme }) => THEMES[$theme].fg};
  --st-muted: ${({ $theme }) => THEMES[$theme].muted};
  --st-bar: ${({ $theme }) => THEMES[$theme].bar};
  --st-bar-border: ${({ $theme }) => THEMES[$theme].barBorder};
  --st-btn: ${({ $theme }) => THEMES[$theme].btn};
  --st-btn-hover: ${({ $theme }) => THEMES[$theme].btnHover};

  /* o CifraRenderer usa estas variáveis globais: sobrescreve só aqui dentro */
  --bg-card: transparent;
  --main: ${({ $theme }) => THEMES[$theme].chord};
  --text-primary: ${({ $theme }) => THEMES[$theme].fg};
  --text-secondary: ${({ $theme }) => THEMES[$theme].fg};
  --text-muted: ${({ $theme }) => THEMES[$theme].muted};

  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--st-bg);
  color: var(--st-fg);
  display: flex;
  flex-direction: column;
  overscroll-behavior: contain;
`;

export const Scroller = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

export const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  /* espaço pra barra do topo e a de baixo não cobrirem a letra */
  padding: 96px 20px 120px;

  @media (max-width: 700px) {
    padding: 140px 10px 120px;
  }

  /* Tablet/celular deitado: a cifra em 2 colunas, sem cortar linhas no meio */
  @media (orientation: landscape) and (min-width: 900px) {
    > div {
      column-count: 2;
      column-gap: 48px;
    }
    > div > * {
      break-inside: avoid;
    }
  }
`;

const barBase = `
  position: fixed;
  left: 0;
  right: 0;
  z-index: 2;
  transition: opacity 0.25s ease, transform 0.25s ease;
`;

export const TopBar = styled.div`
  ${barBase}
  top: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding: 10px 14px;
  background: var(--st-bar);
  border-bottom: 1px solid var(--st-bar-border);
  backdrop-filter: blur(8px);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "-100%")});
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};

  button {
    min-height: 40px;
    min-width: 40px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    border-radius: 10px;
    background: var(--st-btn);
    color: var(--st-fg);
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:hover {
    background: var(--st-btn-hover);
  }

  button.on {
    background: #4f46e5;
    color: #fff;
  }

  .close {
    background: #dc2626;
    color: #fff;
  }

  .title {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1 1 160px;
    line-height: 1.2;

    strong {
      font-size: 1.05rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      font-size: 0.8rem;
      color: var(--st-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .counter {
    font-weight: 800;
    color: var(--st-muted);
  }
`;

export const Group = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .value {
    min-width: 64px;
    text-align: center;
    font-weight: 800;
    font-size: 0.9rem;
  }
`;

export const BottomBar = styled.div`
  ${barBase}
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px 14px 14px;
  background: var(--st-bar);
  border-top: 1px solid var(--st-bar-border);
  backdrop-filter: blur(8px);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "100%")});
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};

  button {
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    border: none;
    border-radius: 12px;
    background: var(--st-btn);
    color: var(--st-fg);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    min-width: 0;
  }

  button span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button.next {
    justify-content: flex-end;
    background: #4f46e5;
    color: #fff;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

// Pontinho que pisca no tempo, visível mesmo com a barra escondida
export const BeatDot = styled.span`
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 3;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $on }) => ($on ? "#22c55e" : "transparent")};
  border: 2px solid #22c55e;
  transition: background 0.05s;
  pointer-events: none;
`;

export const Hint = styled.div`
  position: fixed;
  left: 50%;
  bottom: 74px;
  transform: translateX(-50%);
  z-index: 1;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--st-bar);
  color: var(--st-muted);
  font-size: 0.75rem;
  white-space: nowrap;
  max-width: 94vw;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease;
  pointer-events: none;

  @media (max-width: 700px) {
    display: none;
  }
`;
