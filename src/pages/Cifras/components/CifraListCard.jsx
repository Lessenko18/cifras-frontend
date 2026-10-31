import { Link } from "react-router-dom";
import AddToPlaylist from "../../../components/AddToPlaylist/AddToPlaylist";
import { AnCifra } from "../CifraStyled";

const CATEGORY_ICONS = {
  Igreja: "⛪",
  Sertanejo: "🤠",
  Gospel: "🙏",
  Pop: "🎤",
  Rock: "🎸",
  MPB: "🎵",
  Infantil: "🧒",
  Natal: "🎄",
  Páscoa: "✝️",
};

// Ícone pelo nome da categoria (ou da categoria pai); 🎵 quando não reconhece
export function getCategoryIcon(categoryName, parentName) {
  const search = (parentName || categoryName || "").toLowerCase();
  if (!search) return "🎵";
  const key = Object.keys(CATEGORY_ICONS).find((k) => search.includes(k.toLowerCase()));
  return key ? CATEGORY_ICONS[key] : "🎵";
}

// Card de uma cifra na lista: favoritar, adicionar à playlist, artista e categorias.
export default function CifraListCard({ cifra, categorias, isFav, onToggleFav }) {
  const parentNameOf = (categoria) => {
    if (!categoria) return "";
    if (categoria.parent?.nome) return categoria.parent.nome;
    const parentId = typeof categoria.parent === "string" ? categoria.parent : categoria.parent?._id;
    return categorias.find((c) => c._id === parentId)?.nome || "";
  };

  return (
    <Link to={`/home/cifra/${cifra._id}`}>
      <AnCifra>
        <button
          type="button"
          className="heart-btn"
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFav(cifra._id);
          }}
        >
          {isFav ? "♥" : "♡"}
        </button>
        <h2>{cifra.nome}</h2>
        <span className="add-playlist">
          <AddToPlaylist cifraId={cifra._id} cifraNome={cifra.nome} />
        </span>
        {cifra.artista && <p className="artista">{cifra.artista}</p>}
        <div>
          {cifra.categorias?.map((cat) => {
            const catId = typeof cat === "string" ? cat : cat?._id;
            const categoria = categorias.find((c) => c._id === catId);
            const parentName = parentNameOf(categoria);
            return (
              <span key={catId} title={parentName || undefined}>
                {getCategoryIcon(categoria?.nome, parentName)} {categoria?.nome}
              </span>
            );
          })}
        </div>
      </AnCifra>
    </Link>
  );
}
