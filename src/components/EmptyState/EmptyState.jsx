import { FiHeart, FiInbox, FiList, FiMusic, FiSearch, FiClock } from "react-icons/fi";
import { Wrap, Art } from "./EmptyStateStyled";

const ICONS = {
  cifra: FiMusic,
  playlist: FiList,
  favorito: FiHeart,
  busca: FiSearch,
  relato: FiInbox,
  historico: FiClock,
};

/**
 * Estado vazio com ilustração. `icon`: cifra | playlist | favorito | busca |
 * relato | historico. `action` é opcional (ex.: um botão).
 */
export default function EmptyState({ icon = "cifra", title, text, action, compact = false }) {
  const Icon = ICONS[icon] || FiMusic;

  return (
    <Wrap $compact={compact} role="status">
      <Art aria-hidden="true">
        <span className="dot d1" />
        <span className="dot d2" />
        <span className="dot d3" />
        <span className="halo" />
        <span className="badge">
          <Icon size={compact ? 26 : 34} />
        </span>
      </Art>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </Wrap>
  );
}
