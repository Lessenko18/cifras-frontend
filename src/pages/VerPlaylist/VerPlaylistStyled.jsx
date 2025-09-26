import styled from "styled-components";

export const Page = styled.div`
  padding: 16px;
  max-width: 1000px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
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
  margin-bottom: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const TituloMusica = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.08rem;
  font-weight: 600;
`;

export const TextoCifra = styled.pre`
  margin: 0;
  font-size: 1rem;
  line-height: 1.35rem;
  white-space: pre-wrap;
  overflow-x: auto;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px;
`;

export const Empty = styled.div`
  padding: 24px 0;
  color: #777;
  text-align: center;
`;
