import styled from "styled-components";

export const VerCifraContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  padding: 0 10px;

  .ver-cifra-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ver-cifra-back {
    margin-left: -6px;
  }

  &.partes {
    max-width: 1300px;
  }
`;

export const CifraBody = styled.div``;

export const CifraContent = styled.div`
  display: grid;
  margin: 50px auto;
  justify-items: center;

  background: #fafafa;
  color: #222;
  border-radius: 10px;
  padding: 20px;
  gap: 40px;
  max-width: 850px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);

  &.partes {
    max-width: 1300px;
  }

  a {
    color: #0070f3;
    text-decoration: underline;
    font-style: italic;
    margin-left: auto;
  }

  .cifra-partes {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr max-content 1fr;
    gap: 20px;

    & > span {
      background-color: #ddd;
      width: 2px;
      height: 100%;
    }
  }

  pre {
    font-size: 18px;
    line-height: 1.4rem;
    white-space: pre-wrap;
    background-color: #fafafa;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #030303;
    width: 100%;
    max-width: 750px;
    overflow-x: auto;
    color: #000;
    @media only screen and (max-width: 580px) {
      font-size: 13px;
      line-height: 1.2rem;
    }
  }
`;

export const UpdateCifra = styled.form`
  display: grid;
  margin: 50px auto;
  justify-items: center;
  max-width: 850px;
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 30px;
  gap: 20px;

  textarea {
    padding: 20px;
    font-size: 18px;
  }

  div {
    max-width: 400px;
    width: 100%;
    label {
      font-size: 20px;
      font-weight: 600px;
    }
    input {
      width: 100%;
    }
  }
`;

export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 300px;
  width: 100%;
  margin: 15px auto;
  text-align: center;
  border: 1px solid #000;
  display: grid;
  gap: 15px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  div {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;
