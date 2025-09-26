import styled from "styled-components";

export const CifrasContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  gap: 40px;
`;

export const CifrasBody = styled.div`
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

/* overlay escurecido  */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 9;
`;

/* MODAL CREATE*/
export const ModalCifra = styled.form`
  background: #fff;
  width: 440px; /* mais fino */
  max-width: calc(100% - 24px);
  padding: 22px 24px;
  border-radius: 14px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  border: 1px solid #e5e7eb;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 14px;

  p {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
  }
  h3 {
    font-size: 20px;
    font-weight: 800;
    margin: 0 28px 8px 0; /* espaço pro botão X */
    color: #0f172a;
  }

  label {
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
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
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
  }
`;

/* Reutilize o mesmo para editar */
export const ModalEdit = ModalCifra;

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

/* grid de categorias em "pílulas"*/
export const CategoriesGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const CategoryItem = styled.label`
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  input {
    margin: 0;
  }
  span {
    color: #0f172a;
    font-weight: 600;
  }
`;

/* Item da lista  */
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

/* Modal de delete que você já tinha */
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
