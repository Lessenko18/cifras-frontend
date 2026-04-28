import styled from "styled-components";

/* ── Layout principal ─────────────────────────────── */
export const HomeWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Painel genérico (card escuro/claro) ──────────── */
export const Panel = styled.div`
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

/* ── Cabeçalho do painel ──────────────────────────── */
export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PanelTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
`;

export const CreatePlaylistBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #7c3aed);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4);
    color: #fff;
  }
`;

/* ── Grid de cards de playlist ────────────────────── */
export const PlaylistCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Card de playlist ─────────────────────────────── */
export const PlaylistCard = styled.article`
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .card-head {
    background: var(--card-head-bg);
    color: var(--card-head-text);
    padding: 12px 40px 12px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 0.95rem;
    min-height: 52px;

    span {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.2;
    }

    img {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 10px 14px 14px;
    gap: 10px;
  }

  .card-count {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .card-actions-corner {
    position: absolute;
    top: 56px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }

  .card-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.2s;

    img {
      width: 15px;
      height: 15px;
    }

    &:hover {
      background: var(--bg-input);
    }
  }

  .ver-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #6b5cff, #5a4ad9);
    color: #fff;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    margin-top: auto;
    box-shadow: 0 4px 10px rgba(107, 92, 255, 0.3);
    transition: transform 0.15s, box-shadow 0.15s;
    align-self: flex-start;

    img {
      width: 14px;
      height: 14px;
      filter: brightness(0) invert(1);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(107, 92, 255, 0.4);
    }
  }
`;

/* ── Empty state playlists ────────────────────────── */
export const PlaylistEmpty = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 0.95rem;

  p {
    margin: 0 0 14px;
  }
`;

/* ── Painel direito: filtros ──────────────────────── */
export const FiltersContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

export const FilterInput = styled.input`
  flex: 1;
  min-width: 100%;
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: border 0.2s;

  &:focus {
    outline: none;
    border-color: var(--main);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

export const FilterDropdownWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 140px;
`;

export const FilterDropdownTrigger = styled.button`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;

  &:focus {
    outline: none;
    border-color: var(--main);
  }
`;

export const FilterDropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--light);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.3);
  z-index: 200;
  min-width: 200px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
`;

export const FilterDropdownItem = styled.button`
  width: 100%;
  padding: 8px 14px;
  padding-left: ${({ $indent }) => ($indent ? "28px" : "14px")};
  text-align: left;
  background: ${({ $active }) => ($active ? "#ede9fe" : "transparent")};
  color: ${({ $active }) => ($active ? "#6d28d9" : "var(--text-secondary)")};
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  font-size: 0.88rem;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? "#ede9fe" : "var(--bg-input)")};
  }
`;

export const FavBtn = styled.button`
  height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid
    ${({ $active }) => ($active ? "#fda4af" : "var(--border-color)")};
  background: ${({ $active }) => ($active ? "#fecdd3" : "var(--bg-input)")};
  color: ${({ $active }) => ($active ? "#e11d48" : "var(--text-muted)")};
  transition: all 0.2s;
  white-space: nowrap;
`;

/* ── Lista de cifras (painel direito) ─────────────── */
export const CifraList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CifraItem = styled.article`
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .cifra-head {
    background: var(--card-head-bg);
    color: var(--card-head-text);
    padding: 10px 42px 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    position: relative;
  }

  h2 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.2;
  }

  .heart-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: var(--card-head-text);
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    transition: transform 0.15s;

    &:hover {
      transform: translateY(-50%) scale(1.25);
    }
  }

  .cifra-body {
    padding: 10px 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cifra-artista {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .cifra-cats {
    font-size: 0.78rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/* ── Paginação ────────────────────────────────────── */
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

export const PaginationButton = styled.button`
  background: var(--tom-active-bg);
  color: var(--tom-active-text);
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
`;
