import AddToPlaylist from "../../components/AddToPlaylist/AddToPlaylist";
import { useRef, useState, memo } from "react";
import { Link } from "react-router-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import { FiShare2, FiEdit2, FiTrash2, FiMusic, FiMoreVertical } from "react-icons/fi";
import { getPlaylistBgImage } from "../../utils/playlistVisual";
import { getArtistImage } from "../../utils/artistVisual";
import { AVATAR_PALETTE, getInitials, stripEmoji } from "./homeHelpers";
import { PlaylistCard, CifraItem, RankAvatar, RankAvatarImg } from "./HomeStyled";

/* ── Componentes memoizados ── evitam re-render quando o estado pai muda */
export const PlaylistCardItem = memo(function PlaylistCardItem({ pl, onView, onShare, onEdit, onDelete, canShare, canEdit, canDelete }) {
  const bannerUrl = pl.bannerUrl || getPlaylistBgImage(pl.nome);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));
  return (
    <PlaylistCard
      $bannerUrl={bannerUrl}
      className="clicavel"
      tabIndex={0}
      aria-label={`Abrir playlist ${stripEmoji(pl.nome)}`}
      onClick={() => onView(pl._id)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onView(pl._id);
        }
      }}
    >
      <div className="card-head">
        <FiMusic size={14} aria-hidden="true" />
        <span>{stripEmoji(pl.nome)}</span>
      </div>
      <div className="card-body">
        <span className="card-count">{pl.cifras?.length || 0} música(s)</span>
        <button className="ver-btn" onClick={(e) => { e.stopPropagation(); onView(pl._id); }}>
          <FiMusic size={13} aria-hidden="true" />
          Ver Músicas
        </button>
      </div>
      {(canShare || canEdit || canDelete) && (
        <div className="card-actions-corner" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="card-icon-btn"
            aria-label="Mais ações"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <FiMoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="card-menu" role="menu">
              {canShare && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onShare(pl); }}>
                  <FiShare2 size={14} /> Compartilhar
                </button>
              )}
              {canEdit && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit(pl); }}>
                  <FiEdit2 size={14} /> Editar
                </button>
              )}
              {canDelete && (
                <button type="button" role="menuitem" className="perigo" onClick={() => { setMenuOpen(false); onDelete(pl); }}>
                  <FiTrash2 size={14} /> Excluir
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </PlaylistCard>
  );
});

export const ArtistAvatar = memo(function ArtistAvatar({ artista, bg }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = getArtistImage(artista);
  if (imgSrc && !imgError) {
    return <RankAvatarImg src={imgSrc} alt={artista} onError={() => setImgError(true)} />;
  }
  return <RankAvatar $bg={bg}>{getInitials(artista)}</RankAvatar>;
});

export const CifraListItem = memo(function CifraListItem({ cifra, isFav, onToggleFav, getCatLabel }) {
  return (
    <Link to={`/home/cifra/${cifra._id}`}>
      <CifraItem>
        <div className="cifra-head">
          <h2>{cifra.nome}</h2>
          <AddToPlaylist cifraId={cifra._id} cifraNome={cifra.nome} />
          <button
            type="button"
            className="heart-btn"
            aria-label={isFav ? "Remover favorito" : "Adicionar favorito"}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(cifra._id); }}
          >
            {isFav ? "♥" : "♡"}
          </button>
        </div>
        <div className="cifra-body">
          {cifra.artista && <span className="cifra-artista">{cifra.artista}</span>}
          <span className="cifra-cats">
            {cifra.categorias?.map((cat, i) => (
              <span key={typeof cat === "string" ? cat : cat?._id}>
                {i > 0 && " · "}{getCatLabel(cat)}
              </span>
            ))}
          </span>
        </div>
      </CifraItem>
    </Link>
  );
});
