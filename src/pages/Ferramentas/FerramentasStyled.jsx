import styled from "styled-components";

export const Page = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 0 auto 50px;
  padding: 16px;
  font-size: 14px;

  > header {
    margin-bottom: 20px;
  }

  > header h1 {
    font-size: 1.6rem;
    font-weight: 700;
  }

  > header p {
    color: var(--text-muted);
    margin-top: 4px;
  }

  @media (max-width: 700px) {
    padding: 10px 8px;
  }
`;

export const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 22px;

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  > p.hint {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-bottom: 16px;
  }

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

export const TunerToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => ($active ? "#ef4444" : "linear-gradient(135deg, #0ea5e9, #7c3aed)")};
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const TunerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  position: relative;
`;

export const DeviceMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--tom-btn-bg);
  color: var(--text-primary);

  &:hover {
    background: var(--velocimetro-hover);
  }
`;

export const DeviceMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 20;
  min-width: 280px;
  max-width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  padding: 14px;

  h3 {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
`;

export const DeviceOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 6px;
  border-radius: 8px;
  text-align: left;
  color: var(--text-primary);
  font-size: 0.88rem;

  &:hover {
    background: var(--velocimetro-hover);
  }

  .radio {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &.active .radio {
    border-color: #7c3aed;
  }

  &.active .radio::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7c3aed;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const TunerError = styled.p`
  margin-top: 12px;
  color: #ef4444;
  font-size: 0.85rem;
`;

export const TunerDisplay = styled.div`
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 190px;
  justify-content: center;

  .note {
    font-size: 3.6rem;
    font-weight: 800;
    line-height: 1;
    color: ${({ $status }) =>
      $status === "in-tune" ? "#22c55e" : $status === "close" ? "#f59e0b" : "var(--text-primary)"};
    transition: color 0.15s ease;
  }

  .octave {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--text-muted);
    vertical-align: super;
    margin-left: 2px;
  }

  .freq {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .placeholder {
    color: var(--text-muted);
    font-size: 0.95rem;
    text-align: center;
  }
`;

export const Gauge = styled.div`
  position: relative;
  width: 100%;
  max-width: 340px;
  height: 60px;
`;

export const GaugeTrack = styled.div`
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 6px;
  margin-top: 14px;
  background: linear-gradient(
    to right,
    #ef4444 0%,
    #f59e0b 30%,
    #22c55e 46%,
    #22c55e 54%,
    #f59e0b 70%,
    #ef4444 100%
  );

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -4px;
    width: 2px;
    height: 18px;
    background: var(--text-primary);
    opacity: 0.5;
    transform: translateX(-50%);
  }
`;

export const GaugeNeedle = styled.div`
  position: absolute;
  top: -10px;
  left: ${({ $percent }) => $percent}%;
  width: 3px;
  height: 26px;
  border-radius: 2px;
  background: var(--text-primary);
  transform: translateX(-50%);
  transition: left 0.1s linear;
`;

