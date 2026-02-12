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
  align-items: stretch;

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
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 170px;
  &:hover {
    transform: scale(1.01);
  }

  h3 {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 8px;
    color: #0f172a;
    min-height: 58px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .count {
    color: #6b7280;
    margin-bottom: 14px;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }

  .share-corner {
    position: absolute;
    top: 12px;
    right: 12px;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
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
  max-height: 500px;
  overflow-y: scroll;

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

export const ShareInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
`;

export const ShareList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  .chip button {
    border: none;
    background: #fff;
    color: #ef4444;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    line-height: 1;
    font-weight: 700;
  }
`;

export const SuggestList = styled.div`
  display: grid;
  gap: 6px;
  margin-top: 8px;

  button {
    text-align: left;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    font-size: 0.92rem;
  }

  button:hover {
    background: #f1f5f9;
  }
`;

export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 350px;
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
