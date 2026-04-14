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

  .cifra-topo {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    a {
      color: #0070f3;
      text-decoration: underline;
      font-style: italic;
      margin-left: auto;
    }
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

export const TomButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #f1f1f1;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;

  span.tom-label {
    color: #444;
  }
  span.tom-value {
    color: #6b5cff;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9;
`;

export const ModalTom = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  width: 270px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  .tom-titulo {
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 14px;

    span {
      color: #6b5cff;
    }
  }

  .tom-semitom {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    button {
      flex: 1;
      padding: 8px 4px;
      border-radius: 8px;
      border: 1px solid #ccc;
      background: #f1f1f1;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        background: #e4e4e4;
      }
    }
  }

  .tom-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 16px;

    button {
      padding: 9px 4px;
      border-radius: 8px;
      border: 1px solid #ccc;
      background: #f1f1f1;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        background: #e4e4e4;
      }

      &.ativo {
        background: #222;
        color: #fff;
        border-color: #222;
      }
    }
  }

  .tom-restaurar {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f1f1f1;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #e4e4e4;
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
