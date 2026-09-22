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

/* ── Insights (mais acessadas / músicas / artistas) ─ */
export const InsightsWrapper = styled.section`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 50px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
  }
`;

export const InsightPanel = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ $bgImage }) =>
    $bgImage
      ? `linear-gradient(160deg, rgba(20, 12, 40, 0.82) 0%, rgba(30, 16, 55, 0.78) 55%, rgba(35, 18, 60, 0.85) 100%), url("${$bgImage}")`
      : "linear-gradient(160deg, #1b1030 0%, #241542 55%, #2a1750 100%)"};
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(167, 139, 250, 0.18);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 14px 34px -16px rgba(76, 29, 149, 0.55);

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -60px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.35), transparent 70%);
    pointer-events: none;
  }
`;

export const InsightPanelHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const InsightIconBadge = styled.div`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  background: ${({ $gradient }) => $gradient || "linear-gradient(135deg, #8b5cf6, #6d28d9)"};
  box-shadow: 0 6px 16px -4px rgba(124, 58, 237, 0.6);
`;

export const InsightPanelTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const InsightPanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InsightPanelSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SeeAllButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  color: #c4b5fd;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: #ddd6fe;
    text-decoration: underline;
  }
`;

/* Listas ranqueadas (músicas / artistas / novas) */
export const RankedList = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RankedRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 6px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

export const RankIndex = styled.span`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: #c4b5fd;
  font-weight: 800;
  font-size: 0.76rem;
`;

const SQUARE_GRADIENTS = [
  "linear-gradient(135deg, #7c3aed, #4c1d95)",
  "linear-gradient(135deg, #0ea5e9, #0369a1)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #ec4899, #9d174d)",
  "linear-gradient(135deg, #14b8a6, #0f766e)",
];

const SQUARE_VARIANTS = {
  purple: "linear-gradient(135deg, #7c3aed, #4c1d95)",
  blue: "linear-gradient(135deg, #0ea5e9, #0369a1)",
};

export const RankIconSquare = styled.div`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: ${({ $variant, $index = 0 }) =>
    SQUARE_VARIANTS[$variant] || SQUARE_GRADIENTS[$index % SQUARE_GRADIENTS.length]};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
`;

export const RankAvatar = styled.div`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RankAvatarImg = styled.img`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
`;

export const RankInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const RankName = styled.span`
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RankSub = styled.span`
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RankStat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $variant }) =>
    $variant === "date" ? "rgba(255, 255, 255, 0.5)" : $variant === "plays" ? "#a78bfa" : "#fbbf24"};
`;

export const InsightEmpty = styled.p`
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.88rem;
  margin: 0;
`;

export const ActiveFilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--main);
  background: rgba(124, 58, 237, 0.12);
  color: var(--main);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
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

/* ── Card de playlist (com capa/foto de fundo) ────── */
export const PlaylistCard = styled.article`
  --cover: ${({ $bannerUrl }) =>
    $bannerUrl ? `url("${$bannerUrl}")` : "none"};

  background-image:
    linear-gradient(180deg, rgba(30, 20, 60, 0.15) 0%, rgba(20, 12, 46, 0.88) 78%),
    var(--cover), linear-gradient(135deg, #4c3a94, #2a1f5e);
  background-size: cover;
  background-position: center;
  border-radius: 14px;
  overflow: hidden;
  min-height: 170px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px 44px 14px 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 800;
    font-size: 0.98rem;
    margin-bottom: 4px;

    span {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.25;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    img {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      filter: brightness(0) invert(1);
    }
  }

  .card-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-count {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.75);
    font-weight: 500;
  }

  .card-actions-corner {
    position: absolute;
    top: 10px;
    right: 8px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .card-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.28);
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.2s;

    img {
      width: 14px;
      height: 14px;
      filter: brightness(0) invert(1);
    }

    &:hover {
      background: rgba(0, 0, 0, 0.5);
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
  padding: 12px 40px 12px 16px;
  position: relative;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .cifra-head {
    display: flex;
    align-items: flex-start;
  }

  h2 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.25;
  }

  .heart-btn {
    position: absolute;
    right: 12px;
    top: 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: var(--text-muted);
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.2);
    }
  }

  .cifra-body {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cifra-artista {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
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
