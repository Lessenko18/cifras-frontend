import styled from "styled-components";

export const HomeContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  display: grid;
  gap: 28px;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  border-radius: 12px;

  @media only screen and (max-width: 924px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }

  a {
    width: 100%;
    max-width: 350px;
    transition: 0.3s;
    border-radius: 8px;
    display: flex;
    background: transparent;
    padding: 0;

    &:hover {
      transform: scale(1.01);
    }
  }
`;

export const AnCifra = styled.article`
  background-color: var(--light);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  max-width: 350px;
  width: 100%;
  min-height: 105px;

  border-radius: 8px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  transition: 0.3s;

  h2 {
    font-weight: 700;
    font-size: 18px;
    color: #000000;
  }

  div {
    span {
      font-weight: 500;
      background-color: #000;
      font-size: 15px;
      color: #fff;
      border-radius: 40px;
      padding: 5px 10px;
    }
  }
`;

/* PAGINAÇÃO */
export const PaginationContainer = styled.div`
  grid-column: 1 / -1;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;

  margin-top: 30px;
  margin-bottom: 30px;
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

// Filtros
export const FiltersContainer = styled.div`
  grid-column: 1 / -1;

  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;

  background: #ffffff;
  padding: 14px 16px;
  border-radius: 16px;

  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px -14px rgba(0, 0, 0, 0.25);

  width: 100%;
  margin: 0 auto;

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
