import { useCallback, useEffect, useMemo } from "react";
import { Page, CardsGrid, Card, CifrasGrid } from "./PlaylistStyled";
import { useSearch } from "../../hooks/useSearch";
import { usePageSearchBox } from "../../context/PageSearchContext";
import { useInitialUrlFilters, useSyncUrlFilters } from "../../hooks/useUrlFilters";
import { getPlaylistBgImage } from "../../utils/playlistVisual";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonCards } from "../../components/Skeleton/Skeleton";
import { usePlaylists, useInvalidatePlaylists } from "../../hooks/queries/usePlaylists";
import { useNavigate } from "react-router-dom";
import { UsersHeader } from "../Users/UsersStyled";
import toast from "react-hot-toast";
import PlaylistActionsMenu from "../../components/PlaylistActionsMenu/PlaylistActionsMenu";
import { usePlaylistManager } from "../../components/PlaylistManager/PlaylistManager";
import { useAuth } from "../../context/AuthContext";
import { getPlaylistPermissions } from "../../utils/playlistAccess";

const NO_PLAYLISTS = [];

export default function Playlists() {
  const playlistsQuery = usePlaylists();
  const playlists = playlistsQuery.data ?? NO_PLAYLISTS;
  const isLoadingPlaylists = playlistsQuery.isLoading;
  const invalidatePlaylists = useInvalidatePlaylists();

  const { user: authenticatedUser, isAdmin } = useAuth();
  const urlFilters = useInitialUrlFilters();
  const { search: searchNome, setSearch: setSearchNome, debounced, normalize } = useSearch(300, urlFilters.get("q"));
  useSyncUrlFilters({ q: searchNome });

  usePageSearchBox({
    placeholder: "Pesquisar playlist",
    value: searchNome,
    onChange: setSearchNome,
  });

  const navigate = useNavigate();

  /* ======================
     MAP DE CIFRAS (opcional)
  ====================== */
  /* ======================
     HANDLERS
  ====================== */

  const stripMusicEmoji = useCallback((value) => {
    if (typeof value !== "string") return value || "";
    return value.replace(/^[\s]*(?:🎵|🎶|♪|♫)\s*/u, "");
  }, []);

  const filteredPlaylists = useMemo(() => {
    const sorted = [...playlists].sort((a, b) => a.nome.localeCompare(b.nome));
    const query = normalize(debounced.trim());
    if (!query) return sorted;
    return sorted.filter((pl) =>
      normalize(stripMusicEmoji(pl.nome)).includes(query),
    );
  }, [playlists, debounced, normalize, stripMusicEmoji]);

  useEffect(() => {
    if (playlistsQuery.isError) toast.error("Falha ao carregar playlists.");
  }, [playlistsQuery.isError]);

  const manager = usePlaylistManager({ onChanged: invalidatePlaylists });

  return (
    <Page>
      <UsersHeader>
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn adicionar-primary" onClick={manager.openCreate}>
            Criar Nova Playlist
          </button>
        </div>
      </UsersHeader>

      {isLoadingPlaylists ? (
        <SkeletonCards count={6} columns={3} height={170} />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="Você ainda não tem playlists"
          text="Crie sua primeira playlist para organizar suas músicas favoritas."
          action={
            <button
              type="button"
              className="btn adicionar-primary empty-action"
              onClick={manager.openCreate}
            >
              Criar primeira playlist
            </button>
          }
        />
      ) : filteredPlaylists.length === 0 ? (
        <EmptyState icon="busca" title="Nenhuma playlist encontrada" text="Tente pesquisar por outro nome." />
      ) : (
        <CardsGrid>
          {filteredPlaylists
            .map((pl) => {
              const { canShare, canEdit, canDelete } = getPlaylistPermissions(pl, authenticatedUser, isAdmin);
              const displayName = stripMusicEmoji(pl.nome);

              const bannerUrl = pl.bannerUrl || getPlaylistBgImage(pl.nome);

              return (
                <Card key={pl._id} $bannerUrl={bannerUrl}>
                  <div className="playlist-title">
                    <img src="/music.svg" alt="" aria-hidden="true" />
                    <span>{displayName}</span>
                  </div>
                  <div className="playlist-count">
                    <span>{pl.cifras?.length || 0} música(s)</span>
                  </div>
                  <PlaylistActionsMenu
                    playlist={pl}
                    canShare={canShare}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onShare={manager.openShare}
                    onEdit={manager.openEdit}
                    onDelete={manager.openDelete}
                  />
                  <div className="actions">
                    <button
                      className="playlist-action"
                      onClick={() => navigate(`/home/playlists/${pl._id}/ver`)}
                    >
                      <img src="/music.svg" alt="" aria-hidden="true" />
                      <span>Ver Músicas</span>
                    </button>
                  </div>
                </Card>
              );
            })}
        </CardsGrid>
      )}

      {/* modais de criar/editar/compartilhar/excluir playlist */}
      {manager.modals}
    </Page>
  );
}
