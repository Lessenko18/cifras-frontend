import { useState } from "react";
import * as S from "./CifraStyled";
import { UsersHeader } from "../Users/UsersStyled";
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
  Wrapper: S.FilterDropdownWrapper,
  Trigger: S.FilterDropdownTrigger,
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

  const busca = useCifrasBusca({ limit: 15, showParent: true });
  const {
    categorias, cifras, pages, loaded, refetch, search, setSearch, categoriaFiltro, setCategoriaFiltro,
    filterLabel, favoritosMode, setFavoritosMode, handleToggleFavoritosMode, favoritosIds, favoritosSet,
    handleToggleFavorito, currentPage, setCurrentPage,
  } = busca;

  usePageSearchBox({ placeholder: "Pesquisar música", value: search, onChange: setSearch });

  return (
    <S.CifrasContainer>
      <UsersHeader>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <CategoriaFilterDropdown
            categorias={categorias}
            value={categoriaFiltro}
            onChange={setCategoriaFiltro}
            label={filterLabel}
            styles={FILTER_STYLES}
          />

          <FavBtn type="button" $active={favoritosMode} onClick={handleToggleFavoritosMode}>
            {favoritosMode ? "♥" : "♡"} Favoritas
          </FavBtn>

          {(search || categoriaFiltro || favoritosMode) && (
            <button
              type="button"
              className="btn"
              onClick={() => { setSearch(""); setCategoriaFiltro(""); setFavoritosMode(false); }}
            >
              Limpar filtro
            </button>
          )}

          <button
            className="btn adicionar-primary"
            onClick={() => {
              if (requireAuth("Você precisa fazer login para adicionar uma cifra.")) setIsCreating(true);
            }}
          >
            Adicionar Nova Cifra
          </button>

          <button
            className="btn"
            onClick={() => {
              if (requireAuth("Você precisa fazer login para importar cifras.")) setIsImporting(true);
            }}
          >
            Importar PDF
          </button>
        </div>
      </UsersHeader>

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
