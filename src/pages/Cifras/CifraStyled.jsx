import styled from "styled-components";

// Container principal
export const CifrasContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  gap: 24px;
`;

// Filtros
export const FiltersContainer = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;

  background: #ffffff;
  padding: 14px 16px;
  border-radius: 16px;

  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px -14px rgba(0, 0, 0, 0.25);

  transition: box-shadow 0.2s ease;

  &:focus-within {
    box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.35);
  }
`;

export const FilterInput = styled.input`
  flex: 1;
  min-width: 240px;
  height: 44px;
  padding: 0 14px;

  border-radius: 14px;
  border: 1px solid #d1d5db;
  background: #fff;

  font-size: 0.95rem;
  font-weight: 500;
  color: #0f172a;

  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const FilterSelect = styled.select`
  min-width: 200px;
  height: 44px;
  padding: 0 14px;

  border-radius: 14px;
  border: 1px solid #d1d5db;
  background: #fff;

  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;

  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
  }
`;

// Grid das cifras
export const CifrasBody = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  justify-items: center;

  @media (max-width: 924px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  a {
    width: 100%;
    max-width: 300px;
    border-radius: 8px;
    display: flex;
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
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  width: 100%;
  min-height: 120px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: 0.3s;
  justify-content: flex-start;

  h2 {
    min-height: 56px;
    padding: 14px 24px;
    margin: -22px -24px 0;
    background: #e9e3ff;
    color: #4c3fb3;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    span {
      display: inline-flex;
      align-items: center;
      font-weight: 800;
      background: transparent;
      font-size: 15px;
      color: #6b7280;
      border-radius: 0;
      padding: 0;
      margin-right: 0 !important;
    }
  }
`;

// Overlay
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 9;
`;

// Modal criar/editar
export const ModalCifra = styled.form`
  background: #fff;
  width: 440px;
  max-width: calc(100% - 24px);
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 14px;

  h3 {
    font-size: 20px;
    font-weight: 800;
    margin-right: 28px;
    color: #0f172a;
  }

  label {
    font-weight: 600;
    color: #0f172a;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 0.95rem;
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
  color: #0f172a;

  &:hover {
    background: #f1f5f9;
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
  color: #0f172a;
  margin: 0;
`;
