import { Link } from "react-router-dom";
import { FiHelpCircle } from "react-icons/fi";
import { FooterContainer, FooterInner, CreditBar } from "./FooterStyled";
import { FOOTER_INFO } from "./footerInfo";
import pkg from "../../../package.json";

// SVG em vez de emoji: no Windows o emoji de bandeira aparece só como "BR"
function BrazilFlag() {
  return (
    <svg viewBox="0 0 20 14" width="20" height="14" role="img" aria-label="Bandeira do Brasil">
      <rect width="20" height="14" rx="2" fill="#009c3b" />
      <polygon points="10,1.8 18,7 10,12.2 2,7" fill="#ffdf00" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
      <path d="M7 6.4 Q10 5.6 13 7.6" stroke="#fff" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

export function Footer() {
  const { proxima, autor, criadoEm } = FOOTER_INFO;
  const anoAtual = new Date().getFullYear();
  const ano = anoAtual > criadoEm ? `${criadoEm}–${anoAtual}` : criadoEm;

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

      <CreditBar>
        <span>
          Desenvolvido por <strong>{autor}</strong>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          © {ano} TLCifras
        </span>
        <span aria-hidden="true">·</span>
        <span>v{pkg.version}</span>
        <span aria-hidden="true">·</span>
        <span className="made-in">
          Feito no Brasil <BrazilFlag />
        </span>
      </CreditBar>
    </FooterContainer>
  );
}
