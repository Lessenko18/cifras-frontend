import styled from "styled-components";

export const Page = styled.section`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 50px;
  font-size: 14px;

  > header {
    margin-bottom: 12px;
  }

  > header > button:first-child {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 10px;
  }

  > header > button:first-child img {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 700px) {
    > header > button:first-child {
      width: 46px;
      height: 46px;
    }

    > header > button:first-child img {
      width: 30px;
      height: 30px;
    }
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  background: var(--bg-card);
  padding: 14px 16px;
  border-radius: 16px;

  border: 1px solid var(--border-light);
  box-shadow: 0 8px 24px -14px rgba(0, 0, 0, 0.25);

  transition: box-shadow 0.2s ease;

  &:focus-within {
    box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.35);
  }

  @media (max-width: 700px) {
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
  }
`;

export const FilterInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;

  @media (max-width: 700px) {
    min-width: 100%;
  }
`;

export const FilterInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 36px 0 14px;

  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);

  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);

  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--main);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }

  &::placeholder {
    color: var(--text-muted);
  }

  @media (max-width: 700px) {
    height: 40px;
    font-size: 0.9rem;
    border-radius: 12px;
  }
`;

export const FilterClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--border-light);
    color: var(--text-primary);
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

export const EmptyState = styled.div`
  margin: 12px auto 0;
  max-width: 520px;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 28px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;

  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    opacity: 0.9;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 22px;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.5;
  }

  .empty-action {
    margin-top: 16px;
  }

  @media (max-width: 700px) {
    h3 {
      font-size: 18px;
    }

    p {
      font-size: 14px;
    }
  }
`;

export const Card = styled.article`
  --cover: ${({ $bannerUrl }) => ($bannerUrl ? `url("${$bannerUrl}")` : "none")};

  background-image:
    linear-gradient(180deg, rgba(30, 20, 60, 0.15) 0%, rgba(20, 12, 46, 0.88) 78%),
    var(--cover), linear-gradient(135deg, #4c3a94, #2a1f5e);
  background-size: cover;
  background-position: center;
  border-radius: 14px;
  padding: 16px 44px 16px 18px;
  transition: transform 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 190px;

  &:hover {
    transform: translateY(-2px);
  }

  .playlist-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 800;
    margin: 0 0 4px;
  }

  .playlist-title span {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    line-height: 1.25;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }

  .playlist-count {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.75);
    font-weight: 500;
    margin: 0 0 12px;
  }

  .playlist-title img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  .actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 12px;
    justify-content: flex-start;
  }

  .playlist-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #6b5cff, #5a4ad9);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 6px 14px rgba(107, 92, 255, 0.3);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .playlist-action img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  .playlist-action:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(107, 92, 255, 0.35);
  }

  .share-actions {
    position: absolute;
    top: 10px;
    right: 8px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .icon-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.28);
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.15s ease;

  img {
    width: 14px;
    height: 14px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateY(-1px);
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
    color: #4f46e5;
    text-decoration: none;
  }

  label input[type="checkbox"] {
    margin-top: 0 auto;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
`;

export const ModalBox = styled.form`
  background-color: var(--light);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 420px;
  width: calc(100% - 32px);
  border: 1px solid #000;
  max-height: 85dvh;
  overflow-y: auto;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 400;
  transform: translate(-50%, -50%);

  display: grid;
  gap: 12px;

  h3 {
    margin: 0 0 6px 0;
    text-align: center;
    font-size: 18px;
    font-weight: 800;
  }

  div {
    display: grid;
  }

  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .playlist-mult h3 {
    font-size: 14px;
    font-weight: 100;
    text-align: left;
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
  }

  .chip-deleted {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #b91c1c;
    font-style: italic;
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
  max-width: 420px;
  width: calc(100% - 32px);
  text-align: center;
  border: 1px solid #000;
  display: grid;
  gap: 15px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 400;
  transform: translate(-50%, -50%);

  div {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;
