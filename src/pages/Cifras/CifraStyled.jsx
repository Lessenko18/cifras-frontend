import styled from "styled-components";

// Container principal
export const CifrasContainer = styled.section`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  gap: 24px;
`;

// Filtros
export const FilterDropdownWrapper = styled.div`
  position: relative;
  min-width: 200px;

  @media (max-width: 700px) {
    min-width: 100%;
  }
`;

export const FilterDropdownTrigger = styled.button`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
  text-align: left;

  &:focus {
    outline: none;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 700px) {
    height: 40px;
    font-size: 0.9rem;
    border-radius: 12px;
  }
`;

export const FilterDropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.2);
  z-index: 200;
  min-width: 220px;
  max-height: 340px;
  overflow-y: auto;
  padding: 4px 0;
`;

export const FilterDropdownItem = styled.button`
  width: 100%;
  padding: 9px 16px;
  padding-left: ${({ $indent }) => ($indent ? "32px" : "16px")};
  text-align: left;
  background: ${({ $active }) => ($active ? "#ede9fe" : "transparent")};
  color: ${({ $active }) => ($active ? "#6d28d9" : "var(--text-secondary)")};
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ $active }) => ($active ? "#ede9fe" : "var(--bg-input)")};
  }
`;

// Grid das cifras
export const CifrasBody = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: stretch;

  @media (max-width: 924px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  a {
    width: 100%;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    background: transparent;
    padding: 0;
    transition: 0.3s;

    &:hover {
      transform: scale(1.01);
    }
  }
`;

// Card da cifra
export const AnCifra = styled.article`
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  min-height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s, box-shadow 0.15s;
  justify-content: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  h2 {
    min-height: 44px;
    padding: 4px 28px 0 0;
    margin: 0;
    background: transparent;
    color: var(--text-primary);
    font-size: 17px;
    font-weight: 600;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .artista {
    font-size: 13px;
    color: var(--text-muted);
    margin: -4px 0 0;
    font-weight: 500;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    > span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 0.78rem;
      color: var(--text-muted);
      background: var(--bg-input);
      border: 1px solid var(--border-light);
      border-radius: 999px;
      padding: 3px 10px;
    }
  }

  .add-playlist {
    position: absolute;
    top: 8px;
    right: 44px;
    z-index: 2;
    display: block;
    background: none;
    border: none;
    padding: 0;
  }

  .heart-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    background: rgba(255, 255, 255, 0.85);
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #e11d48;
    padding: 3px 6px;
    border-radius: 50%;
    line-height: 1;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.25);
    }
  }
`;

// Overlay
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 300;
`;

// Modal criar/editar
export const ModalCifra = styled.form`
  background: var(--light);
  width: 440px;
  max-width: calc(100% - 24px);
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 400;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 14px;

  h3 {
    font-size: 20px;
    font-weight: 800;
    margin-right: 28px;
    color: var(--text-primary);
  }

  label {
    font-weight: 600;
    color: var(--text-primary);
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 0.95rem;
    background: var(--bg-input);
    color: var(--text-primary);
  }

  textarea {
    min-height: 90px;
    resize: vertical;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
  }
`;

export const CloseX = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  font-weight: 700;
  cursor: pointer;
  color: var(--text-primary);

  &:hover {
    background: var(--bg-input);
  }
`;

// Paginação
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 30px;
`;

export const PaginationButton = styled.button`
  background: #000;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: 0.3s;

  &:hover:not(:disabled) {
    background: #1e293b;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;
