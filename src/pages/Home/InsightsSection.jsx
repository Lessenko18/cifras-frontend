import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMusic, FiTrendingUp, FiUsers, FiStar } from "react-icons/fi";
import EmptyState from "../../components/EmptyState/EmptyState";
import {
  InsightsWrapper,
  InsightsGrid,
  InsightPanel,
  InsightPanelHeader,
  InsightIconBadge,
  InsightPanelTitleGroup,
  InsightPanelTitle,
  InsightPanelSubtitle,
  SeeAllButton,
  RankedList,
  RankedRow,
  RankIndex,
  RankIconSquare,
  RankInfo,
  RankName,
  RankSub,
  RankStat,
  InsightEmpty,
} from "./HomeStyled";
import { ArtistAvatar } from "./HomeParts";
import { AVATAR_PALETTE, formatCount, formatRelativeDate } from "./homeHelpers";

const COLLAPSED = 5;
const EXPANDED = 10;
const NO_DATA = "Ainda não há dados suficientes de acesso.";

// Painel de ranking: cabeçalho com "Ver tudo" + lista (ou vazio). `renderRow` desenha cada linha.
function RankPanel({ bgImage, gradient, icon, title, subtitle, items, expanded, onToggle, renderRow, empty }) {
  const list = items || [];
  return (
    <InsightPanel $bgImage={bgImage}>
      <InsightPanelHeader>
        <InsightPanelTitleGroup>
          <InsightIconBadge $gradient={gradient}>{icon}</InsightIconBadge>
          <div>
            <InsightPanelTitle>{title}</InsightPanelTitle>
            <InsightPanelSubtitle>{subtitle}</InsightPanelSubtitle>
          </div>
        </InsightPanelTitleGroup>
        {list.length > COLLAPSED && (
          <SeeAllButton type="button" onClick={onToggle}>
            {expanded ? "Ver menos" : "Ver tudo →"}
          </SeeAllButton>
        )}
      </InsightPanelHeader>
      {list.length ? (
        <RankedList>{list.slice(0, expanded ? EXPANDED : COLLAPSED).map(renderRow)}</RankedList>
      ) : (
        empty
      )}
    </InsightPanel>
  );
}

// Seção "mais acessadas / artistas / novas" da Home.
export default function InsightsSection({ insights, onFilterByArtist }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState({ musicas: false, artistas: false, novas: false });
  const toggle = (key) => () => setOpen((p) => ({ ...p, [key]: !p[key] }));
  const openCifra = (cifra) => navigate(`/home/cifra/${cifra._id}`);

  return (
    <InsightsWrapper>
      <InsightsGrid>
        <RankPanel
          bgImage="/fundoGuitarra.webp"
          gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"
          icon={<FiTrendingUp size={20} aria-hidden="true" />}
          title="Músicas mais acessadas"
          subtitle="As cifras que estão em alta por aqui"
          items={insights.maisAcessadas}
          expanded={open.musicas}
          onToggle={toggle("musicas")}
          empty={<InsightEmpty>{NO_DATA}</InsightEmpty>}
          renderRow={(cifra, i) => (
            <RankedRow key={cifra._id} type="button" onClick={() => openCifra(cifra)}>
              <RankIndex>{i + 1}</RankIndex>
              <RankIconSquare $variant="purple"><FiMusic size={15} /></RankIconSquare>
              <RankInfo>
                <RankName>{cifra.nome}</RankName>
                {cifra.artista && <RankSub>{cifra.artista}</RankSub>}
              </RankInfo>
              {formatCount(cifra.acessos) && <RankStat $variant="fire">🔥 {formatCount(cifra.acessos)}</RankStat>}
            </RankedRow>
          )}
        />

        <RankPanel
          bgImage="/MaisAcessados.webp"
          gradient="linear-gradient(135deg, #38bdf8, #0369a1)"
          icon={<FiUsers size={20} aria-hidden="true" />}
          title="Artistas mais acessados"
          subtitle="Os artistas que você mais ouve"
          items={insights.artistasMaisAcessados}
          expanded={open.artistas}
          onToggle={toggle("artistas")}
          empty={<InsightEmpty>{NO_DATA}</InsightEmpty>}
          renderRow={(item, i) => (
            <RankedRow key={item.artista} type="button" onClick={() => onFilterByArtist(item.artista)}>
              <RankIndex>{i + 1}</RankIndex>
              <ArtistAvatar artista={item.artista} bg={AVATAR_PALETTE[i % AVATAR_PALETTE.length]} />
              <RankInfo>
                <RankName>{item.artista}</RankName>
              </RankInfo>
              {formatCount(item.acessos) && <RankStat $variant="plays">▶ {formatCount(item.acessos)}</RankStat>}
            </RankedRow>
          )}
        />

        <RankPanel
          bgImage="/NovasMusicas.webp"
          gradient="linear-gradient(135deg, #a78bfa, #7c3aed)"
          icon={<FiStar size={20} aria-hidden="true" />}
          title="Novas músicas"
          subtitle="As últimas cifras adicionadas"
          items={insights.novas}
          expanded={open.novas}
          onToggle={toggle("novas")}
          empty={<EmptyState compact icon="cifra" title="Nenhuma música cadastrada ainda" />}
          renderRow={(cifra, i) => (
            <RankedRow key={cifra._id} type="button" onClick={() => openCifra(cifra)}>
              <RankIndex>{i + 1}</RankIndex>
              <RankIconSquare $variant="blue"><FiMusic size={15} /></RankIconSquare>
              <RankInfo>
                <RankName>{cifra.nome}</RankName>
                {cifra.artista && <RankSub>{cifra.artista}</RankSub>}
              </RankInfo>
              {formatRelativeDate(cifra.createdAt) && (
                <RankStat $variant="date">🗓 {formatRelativeDate(cifra.createdAt)}</RankStat>
              )}
            </RankedRow>
          )}
        />
      </InsightsGrid>
    </InsightsWrapper>
  );
}
