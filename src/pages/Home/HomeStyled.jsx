import styled from "styled-components";

export const HomeContainer = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  justify-items: center;
  border-radius: 12px;

  a {
    width: 100%;
    min-height: 105px;
    max-width: 350px;
    transition: 0.3s;
    box-shadow: 0 2px 15px -5px #1a1a1a8d;
    border-radius: 8px;
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
