import { useRef, useState } from "react";
import * as S from "./CifraStyled";
import { FiHeart, FiX, FiPlus, FiMoreHorizontal, FiUpload } from "react-icons/fi";
import { useClickOutside } from "../../hooks/useClickOutside";
import { FavBtn } from "../Home/HomeStyled";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonRows } from "../../components/Skeleton/Skeleton";
import ImportarPdf from "../../components/ImportarPdf/ImportarPdf";
import CategoriaFilterDropdown from "../../components/CategoriaFilterDropdown/CategoriaFilterDropdown";
import Paginacao from "../../components/Paginacao/Paginacao";
import { usePageSearchBox } from "../../context/PageSearchContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useCifrasBusca } from "../../hooks/useCifrasBusca";
import NovaCifraModal from "./components/NovaCifraModal";
import CifraListCard from "./components/CifraListCard";

const FILTER_STYLES = {
  Wrapper: S.ToolbarFilterWrapper,
  Trigger: S.ToolbarFilterTrigger,
  Panel: S.FilterDropdownPanel,
  Item: S.FilterDropdownItem,
};
const PAGINATION_STYLES = {
  Container: S.PaginationContainer,
  Button: S.PaginationButton,
  Info: S.PaginationInfo,
};

export default function Cifras() {
  const requireAuth = useRequireAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useClickOutside(moreRef, () => setMoreOpen(false));

  const busca = useCifrasBusca({ limit: 15, showParent: true });
  const {
    categorias, cifras, pages, loaded, refetch, search, setSearch, termo, categoriaFiltro, setCategoriaFiltro,
    filterLabel, favoritosMode, setFavoritosMode, handleToggleFavoritosMode, favoritosIds, favoritosSet,
    handleToggleFavorito, currentPage, setCurrentPage,
  } = busca;

  usePageSearchBox({ placeholder: "Pesquisar música", value: search, onChange: setSearch });

  return (
    <S.CifrasContainer>
      <S.Toolbar role="toolbar" aria-label="Filtros e ações">
        <div className="filters">
          <CategoriaFilterDropdown
            categorias={categorias}
            value={categoriaFiltro}
            onChange={setCategoriaFiltro}
            label={filterLabel}
            styles={FILTER_STYLES}
          />

          <FavBtn type="button" $active={favoritosMode} onClick={handleToggleFavoritosMode} aria-pressed={favoritosMode}>
            <FiHeart size={16} fill={favoritosMode ? "currentColor" : "none"} aria-hidden="true" /> Favoritas
          </FavBtn>

          {(search || categoriaFiltro || favoritosMode) && (
            <button
              type="button"
              className="tool-btn chip"
              onClick={() => { setSearch(""); setCategoriaFiltro(""); setFavoritosMode(false); }}
            >
              <FiX size={14} aria-hidden="true" /> Limpar
            </button>
          )}
        </div>

        <div className="actions">
          <button
            type="button"
            className="tool-btn primary"
            onClick={() => {
              if (requireAuth("Você precisa fazer login para adicionar uma cifra.")) setIsCreating(true);
            }}
          >
            <FiPlus size={18} aria-hidden="true" /> Nova cifra
          </button>

          <div className="more" ref={moreRef}>
            <button
              type="button"
              className="tool-btn icon"
              aria-label="Mais ações"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
            >
              <FiMoreHorizontal size={18} aria-hidden="true" />
            </button>
            {moreOpen && (
              <div className="more-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    if (requireAuth("Você precisa fazer login para importar cifras.")) setIsImporting(true);
                  }}
                >
                  <FiUpload size={18} aria-hidden="true" /> Importar PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </S.Toolbar>

      {isImporting && (
        <ImportarPdf categorias={categorias} onClose={() => setIsImporting(false)} onImported={refetch} />
      )}

      {isCreating && <NovaCifraModal onClose={() => setIsCreating(false)} onCreated={refetch} />}

      <S.CifrasBody>
        {!loaded && <SkeletonRows count={8} />}
        {loaded && cifras.length === 0 && (
          favoritosMode && favoritosIds.length === 0 ? (
            <EmptyState
              icon="favorito"
              title="Você ainda não tem favoritas"
              text="Toque no coração de uma música para salvá-la aqui."
            />
          ) : (
            <EmptyState
              icon="busca"
              title="Nenhuma cifra encontrada"
              text="Tente outro nome ou categoria, ou adicione uma nova cifra."
            />
          )
        )}
        {cifras.map((cifra) => (
          <CifraListCard
            key={cifra._id}
            cifra={cifra}
            termo={termo}
            categorias={categorias}
            isFav={favoritosSet.has(cifra._id)}
            onToggleFav={handleToggleFavorito}
          />
        ))}
      </S.CifrasBody>

      <Paginacao page={currentPage} pages={pages} onChange={setCurrentPage} styles={PAGINATION_STYLES} />
    </S.CifrasContainer>
  );
}
