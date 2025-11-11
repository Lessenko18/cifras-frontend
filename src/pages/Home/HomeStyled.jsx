import styled from "styled-components";

export const HomeContainer = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  justify-items: center;
  border-radius: 12px;

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
  justify-content: start;
  flex-direction: column;
  align-items: left;
  gap: 15px;
  max-width: 350px;
  transition: 0.3s;
  min-height: 105px;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
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
