import styled from "styled-components";

// Garante que o rodapé fique no fim da tela mesmo em páginas curtas
export const PageShell = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
`;

// Mesmo layout do #root (coluna centralizada) pra as páginas se comportarem
// como antes de ganharem este wrapper.
export const PageContent = styled.main`
  flex: 1 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FooterContainer = styled.footer`
  width: 100%;
  margin-top: 40px;
  background-color: #050810;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
`;

export const FooterInner = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;

    img {
      display: block;
      max-width: 130px;
    }
  }

  .footer-help {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;

    &:hover {
      color: #fff;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: right;
    font-size: 0.85rem;
  }

  .footer-tag {
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(124, 58, 237, 0.25);
    border: 1px solid rgba(167, 139, 250, 0.5);
    color: #c4b5fd;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .footer-text {
    color: rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;

    .footer-right {
      text-align: left;
      flex-wrap: wrap;
    }
  }
`;
