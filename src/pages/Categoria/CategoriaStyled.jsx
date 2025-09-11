// src/pages/Categoria/CategoriaStyled.jsx
import styled from "styled-components";

export const CategoriasContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  gap: 40px;
`;

export const CategoriaHeader = styled.header`
  display: grid;
  grid-template-columns: 0.5fr 1fr 0.5fr;
  align-items: center;
  text-align: center;
  gap: 20px;

  button {
    max-width: fit-content;
  }

  .btn {
    margin-left: auto;
    margin-right: 0;
  }
`;

export const CategoriasBody = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
`;

export const ModalCategoria = styled.form`
  background-color: var(--light);
  padding: 20px 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: fit-content;
  margin: 15px auto;
  border: 1px solid #000;
  display: grid;
  gap: 10px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  div {
    display: grid;
    gap: 3px;
  }
  h2,
  h3 {
    text-align: center;
    margin-bottom: 10px;
  }

  #inputLevel {
    display: flex;
    align-items: center;
  }
`;

export const AnCategoria = styled.article`
  border: 1px solid #000;
  background-color: #fff;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  max-width: 500px;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0px 0px 5px #1818186a;

  div {
    display: flex;
    gap: 10px;
    align-items: center;
  }
`;

export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: fit-content;
  width: calc(100% - 24px);
  text-align: center;
  margin: 15px auto;
  border: 1px solid #000;
  display: grid;
  gap: 10px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);

  div {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;

export const ModalEdit = styled.form`
  background-color: var(--light);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 230px;
  width: calc(100% - 20px);
  margin: 15px auto;
  border: 1px solid #000;
  display: grid;
  gap: 10px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);

  h2,
  h3 {
    text-align: center;
    margin-bottom: 10px;
  }

  div {
    display: grid;
    gap: 3px;
  }

  input {
    width: 95%;
    padding: 6px 8px;
    font-size: 14px;
  }
`;
