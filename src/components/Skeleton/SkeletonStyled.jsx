import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export const Bar = styled.div`
  display: block;
  background: linear-gradient(
    90deg,
    var(--border-light) 25%,
    var(--divider) 37%,
    var(--border-light) 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const CardBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
`;

export const RowBox = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
`;
