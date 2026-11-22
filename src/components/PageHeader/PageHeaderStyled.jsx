import styled from "styled-components";

// Cabeçalho de página (voltar · título · ações) e o título, usados por várias telas.
export const UsersHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  text-align: center;
  align-items: center;

  > :first-child {
    justify-self: start;
  }

  > :nth-child(2) {
    justify-self: center;
    text-align: center;
    margin: 0;
    min-width: 0;
  }

  > :last-child {
    justify-self: end;
  }

  button {
    max-width: fit-content;
  }
  .btn {
    margin: 0;
  }

  gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
  }

  @media (max-width: 430px) {
    gap: 6px;
  }

  .btns-header {
    display: flex;
    align-items: center;
    max-width: fit-content;
    margin-left: auto;
    gap: 13px;
    img {
      max-width: 35px;
    }
    @media only screen and (max-width: 700px) {
      img {
        max-width: 25px;
      }
    }
  }
`;

export const Title = styled.h1`
  text-align: center;
  line-height: 1.2em;
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 24px;
  color: var(--text-primary);

  @media (max-width: 700px) {
    font-size: 22px;
  }

  @media (max-width: 530px) {
    font-size: 18px;
  }
  @media (max-width: 360px) {
    font-size: 14px;
  }
`;
