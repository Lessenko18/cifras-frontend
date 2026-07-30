import styled from "styled-components";

export const Page = styled.div`
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 850px) {
    padding: 10px 8px;
  }

  .main-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    @media (max-width: 850px) {
      display: block;
    }
  }
`;
export const PlaylistBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 50px;

  @media (max-width: 850px) {
    max-width: 100%;
    align-items: stretch;
  }
`;
export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 16px;
  text-align: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    word-break: break-word;
    text-align: center;
    flex: 0 1 auto;
  }
  span {
    font-size: 1rem;
    opacity: 0.7;
    white-space: nowrap;
  }
`;

export const CifraCard = styled.section`
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 14px;
  width: 100%;
  margin-bottom: 14px;
  background: var(--light);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .eye-toggle {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    opacity: 0.55;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }

    img {
      width: 18px;
      height: 18px;
      display: block;
    }
  }

  @media (max-width: 850px) {
    padding: 10px 8px;
  }
`;

export const TextoCifra = styled.pre`
  margin-top: 8px;
  margin-bottom: 0;

  font-family: monospace;
  font-size: 1rem;
  line-height: 1.4rem;

  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 14px;

  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;

  text-align: left;

  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  @media (max-width: 675px) {
    font-size: 0.9rem;
    line-height: 1.3rem;
    padding: 8px 8px;
  }

  @media (max-width: 430px) {
    font-size: 0.82rem;
    line-height: 1.22rem;
    padding: 6px 6px;
  }
`;

export const TituloMusica = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
`;

export const Empty = styled.div`
  padding: 24px 0;
  color: var(--text-muted);
  text-align: center;
`;

export const Velocimetro = styled.div`
  position: fixed;
  bottom: 16px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  background: var(--velocimetro-bg);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  width: fit-content;
  height: fit-content;
  z-index: 999;

  .velocimetro-sep {
    width: 70%;
    height: 1px;
    background: var(--border-color);
    margin: 2px 0;
  }

  button {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    transition: background 0.2s;
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--text-secondary);

    &:hover {
      background: var(--velocimetro-hover);
    }

    img {
      width: 18px;
      height: 18px;
      display: block;
    }
  }

  .metronomo {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
  }

  .bpm-value {
    min-width: 30px;
    text-align: center;
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    cursor: text;
  }

  .bpm-input {
    all: unset;
    width: 34px;
    text-align: center;
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--text-secondary);
    background: var(--velocimetro-hover);
    border-radius: 4px;
    padding: 2px 0;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;
  }

  .metronomo-play {
    font-size: 1.1rem !important;
  }

  .metronomo-play.playing {
    background: var(--velocimetro-hover);
    color: #7c3aed;
  }

  .metronomo-save {
    font-size: 0.9rem !important;
  }
`;

export const Sumario = styled.aside`
  position: sticky;
  top: 90px;
  align-self: flex-start;
  background: var(--light);
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 12px;
  width: 250px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  @media (max-width: 850px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85%;
    max-height: 70vh;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 15px;
    color: var(--text-secondary);
    border-radius: 8px;
    margin-bottom: 4px;

    &.ativo {
      background: var(--main);
      color: #fff;
    }
  }
`;
