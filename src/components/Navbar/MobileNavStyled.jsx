import styled from "styled-components";

export const MOBILE_BP = "700px";
export const BOTTOM_BAR_HEIGHT = "64px";

export const BottomBar = styled.nav`
  display: none;

  @media (max-width: ${MOBILE_BP}) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 300;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    height: calc(${BOTTOM_BAR_HEIGHT} + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--chrome-bg);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -8px 24px -12px rgba(0, 0, 0, 0.5);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.75);
    font: inherit;
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.2s;

    svg {
      flex-shrink: 0;
    }

    &.active {
      color: var(--accent);
    }
  }
`;

export const SheetOverlay = styled.div`
  display: none;

  @media (max-width: ${MOBILE_BP}) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 310;
    background: rgba(0, 0, 0, 0.55);
  }
`;

export const Sheet = styled.div`
  display: none;

  @media (max-width: ${MOBILE_BP}) {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 320;
    max-height: 80dvh;
    overflow-y: auto;
    padding: 8px 12px calc(12px + env(safe-area-inset-bottom));
    background: #0b0f1d;
    color: #fff;
    border-radius: 18px 18px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .grip {
    width: 40px;
    height: 4px;
    margin: 4px auto 8px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
  }

  .group {
    margin: 12px 8px 4px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 10px;
    border: none;
    border-radius: 10px;
    background: none;
    color: rgba(255, 255, 255, 0.9);
    font: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    svg {
      flex-shrink: 0;
    }

    &:active {
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      color: var(--accent);
    }

    &.danger {
      color: #fca5a5;
    }
  }
`;
