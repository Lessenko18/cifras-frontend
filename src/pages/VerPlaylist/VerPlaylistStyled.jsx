import styled from "styled-components";

export const Page = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  .main-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    @media (max-width: 850px) {
      display: block; 
    }
  }

  #Openeye,
  #Closeeye {
    position: fixed;
    height: 45px;
    width: 45px;
    padding: 8px;
    bottom: 85px;
    right: 20px;
    z-index: 1001;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    border: 1px solid #ddd;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
export const PlaylistBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
`;
export const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    justify-items: center;
  }
  span {
    font-size: 1rem;
    opacity: 0.7;
  }
`;

export const CifraCard = styled.section`
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 14px;
  width: 100%;
  margin-bottom: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const TextoCifra = styled.pre`
  margin-top: 8px;
  margin-bottom: 0;

  font-family: "italic", monospace;
  font-size: 1rem;
  line-height: 1.4rem;

  background: #fafafa;
  border-radius: 8px;
  padding: 12px 14px;

  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;

  text-align: left;

  // scrollbar
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
    line-height: 1.3rem;
  }
`;

export const TituloMusica = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
`;

export const Empty = styled.div`
  padding: 24px 0;
  color: #777;
  text-align: center;
`;
export const Velocimetro = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: #e9eef5;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  width: fit-content;
  height: fit-content;
  z-index: 999;

  button {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: #d3dae6;
    }

    img {
      width: 22px;
      height: 22px;
      display: block;
    }
  }
`;
export const Sumario = styled.aside`
  position: sticky;
  top: 90px;
  align-self: flex-start;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  width: 250px; /* Largura fixa para desktop */
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  @media (max-width: 850px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85%; /* No celular, ele vira um "modal" centralizado */
    max-height: 70vh;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
  }

  button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 15px;
    color: #333;
    border-radius: 8px;
    margin-bottom: 4px;

    &.ativo {
      background: #222;
      color: #fff;
    }
  }
`;