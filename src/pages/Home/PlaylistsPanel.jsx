import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NextEventCard from "../../components/NextEventCard/NextEventCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonCards } from "../../components/Skeleton/Skeleton";
import { getPlaylistPermissions } from "../../utils/playlistAccess";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  CreatePlaylistBtn,
  PlaylistCardsGrid,
  PlaylistEmpty,
  PaginationContainer,
  PaginationButton,
} from "./HomeStyled";
import { PlaylistCardItem } from "./HomeParts";

const PLAYLISTS_PER_PAGE = 6;

// Mais recentes primeiro. O ObjectId do MongoDB é ordenável cronologicamente,
// então serve de critério quando falta `createdAt`.
function sortByRecent(playlists) {
  return [...playlists].sort((a, b) => {
    if (a?.createdAt && b?.createdAt) {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (diff !== 0) return diff;
    }
    return String(b?._id || "").localeCompare(String(a?._id || ""));
  });
}

// Painel "Minhas Playlists" da Home (convite ao login, vazio, cards e "ver mais").
export default function PlaylistsPanel({ isAuthenticated, user, isAdmin, playlists, loading, manager }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => sortByRecent(playlists), [playlists]);
  const visible = useMemo(() => sorted.slice(0, (page + 1) * PLAYLISTS_PER_PAGE), [sorted, page]);
  const totalPages = Math.ceil(sorted.length / PLAYLISTS_PER_PAGE);

  if (!isAuthenticated) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Minhas Playlists</PanelTitle>
        </PanelHeader>
        <PlaylistEmpty>
          <p>Você precisa fazer login para ver, criar e gerenciar suas playlists.</p>
          <CreatePlaylistBtn as={Link} to="/login" state={{ from: "/home" }}>
            Fazer login
          </CreatePlaylistBtn>
        </PlaylistEmpty>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Minhas Playlists</PanelTitle>
        <CreatePlaylistBtn type="button" onClick={manager.openCreate}>
          + Criar Nova Playlist
        </CreatePlaylistBtn>
      </PanelHeader>

      {!loading && <NextEventCard playlists={playlists} />}

      {loading ? (
        <SkeletonCards count={4} columns={2} height={150} />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="Você ainda não tem playlists"
          text="Monte seu repertório juntando as músicas que você mais toca."
          action={
            <CreatePlaylistBtn type="button" onClick={manager.openCreate}>
              Criar primeira playlist
            </CreatePlaylistBtn>
          }
        />
      ) : (
        <PlaylistCardsGrid>
          {visible.map((pl) => {
            const { canShare, canEdit, canDelete } = getPlaylistPermissions(pl, user, isAdmin);
            return (
              <PlaylistCardItem
                key={pl._id}
                pl={pl}
                canShare={canShare}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={(id) => navigate(`/home/playlists/${id}/ver`)}
                onShare={manager.openShare}
                onEdit={manager.openEdit}
                onDelete={manager.openDelete}
              />
            );
          })}
        </PlaylistCardsGrid>
      )}

      {page + 1 < totalPages && (
        <PaginationContainer>
          <PaginationButton onClick={() => setPage((p) => p + 1)}>
            Ver mais ({sorted.length - visible.length} restantes)
          </PaginationButton>
        </PaginationContainer>
      )}
    </Panel>
  );
}
