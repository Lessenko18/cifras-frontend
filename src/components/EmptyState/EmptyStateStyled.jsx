import styled from "styled-components";

export const Wrap = styled.div`
  width: 100%;
  grid-column: 1 / -1; /* centraliza quando o pai é um grid */
  justify-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: ${({ $compact }) => ($compact ? "18px 12px" : "40px 16px")};

  h3 {
    margin: 6px 0 0;
    font-size: ${({ $compact }) => ($compact ? "1rem" : "1.15rem")};
    font-weight: 800;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    max-width: 380px;
    font-size: 0.92rem;
    color: var(--text-muted);
  }

  > button,
  > a {
    margin-top: 10px;
  }
`;

export const Art = styled.div`
  position: relative;
  width: 110px;
  height: 90px;
  display: grid;
  place-items: center;

  .halo {
    position: absolute;
    width: 86px;
    height: 86px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(124, 58, 237, 0.28), rgba(79, 70, 229, 0.08) 65%, transparent 72%);
  }

  .badge {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: #fff;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    box-shadow: 0 10px 22px -8px rgba(79, 70, 229, 0.6);
    transform: rotate(-6deg);
  }

  .dot {
    position: absolute;
    border-radius: 50%;
    background: #a78bfa;
    opacity: 0.55;
  }
  .d1 { width: 9px; height: 9px; top: 6px; left: 14px; }
  .d2 { width: 6px; height: 6px; bottom: 10px; right: 8px; background: #6366f1; }
  .d3 { width: 12px; height: 12px; top: 18px; right: 4px; opacity: 0.3; }
`;
