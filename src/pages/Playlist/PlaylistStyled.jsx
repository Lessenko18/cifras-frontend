import styled from "styled-components";

export const Page = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 50px;
`;

export const Title = styled.h1`
  text-align: center;
  line-height: 1.2em;
  font-size: 44px;
  font-weight: 800;
  margin: 0 0 24px;
  color: #0f172a;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.article`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 22px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: 0.3s;
  &:hover {
    transform: scale(1.01);
  }

  h3 {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 8px;
    color: #0f172a;
  }

  .count {
    color: #6b7280;
    margin-bottom: 14px;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
`;

export const CifrasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px;
  margin-top: 20px;

  label {
    display: block;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    max-width: 190px;
    width: 100%;
    display: flex;
    gap: 2px;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  label:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  label a {
    display: block;
    margin-top: 8px;
    font-size: 0.85rem;
    color: #4f46e5;
    text-decoration: none;
  }

  label input[type="checkbox"] {
    margin-top: 0 auto;
  }
`;

export const ModalBox = styled.form`
  background-color: var(--light);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 350px;
  width: 100%;
  margin: 20px auto;
  border: 1px solid #000;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 12px;

  h3 {
    margin: 0 0 6px 0;
    text-align: center;
  }

  div {
    display: grid;
  }
`;

export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 400px;
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
