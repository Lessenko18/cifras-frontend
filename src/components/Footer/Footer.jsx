import { Link } from "react-router-dom";
import { FiHelpCircle } from "react-icons/fi";
import { FooterContainer, FooterInner } from "./FooterStyled";
import { FOOTER_INFO } from "./footerInfo";

export function Footer() {
  const { proxima } = FOOTER_INFO;

  return (
    <FooterContainer>
      <FooterInner>
        <div className="footer-left">
          <Link to="/home" aria-label="TLCifras">
            <img src="/tlcifras.webp" alt="Logo TLCifras" />
          </Link>
          <Link to="/home/ajuda" className="footer-help">
            <FiHelpCircle size={15} /> Ajuda e contato
          </Link>
        </div>

        {proxima && (
          <div className="footer-right">
            <span className="footer-tag">{proxima.titulo}</span>
            <span className="footer-text">{proxima.texto}</span>
          </div>
        )}
      </FooterInner>
    </FooterContainer>
  );
}
