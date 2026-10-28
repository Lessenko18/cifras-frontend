import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { FiMonitor } from "react-icons/fi";
import { getPublicPlaylistService } from "../../service/playlistService";
import { CifraRenderer } from "../../components/CifraRenderer/CifraRenderer";
import StageMode from "../../components/StageMode/StageMode";
import {
  detectOriginalKey,
  getKeyAtOffset,
  transposeText,
  useAccidental,
  useSimplify,
} from "../../utils/transpose";

const Page = styled.main`
  width: 100%;
  max-width: 880px;
  padding: 24px 16px 64px;
  color: var(--text-primary);

  h1 {
    margin: 0 0 4px;
    font-size: 1.6rem;
  }
  .meta {
    color: var(--text-muted);
    margin: 0 0 16px;
  }
  .palco {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 10px;
    border: none;
    background: var(--brand-gradient);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 24px;
  }
  article {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }
  article h2 {
    margin: 0;
    font-size: 1.15rem;
  }
  article .artista {
    margin: 2px 0 10px;
    color: var(--text-muted);
    font-style: italic;
  }
  .tom {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    font-size: 0.85rem;
    font-weight: 700;
  }
`;

// Página pública (sem login) de uma playlist compartilhada por link: /p/:slug
export default function PublicPlaylist() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [stageOpen, setStageOpen] = useState(false);
  // re-renderiza ao trocar ♯/♭ ou simplificação
  const acc = useAccidental();
  const simple = useSimplify();

  useEffect(() => {
    document.title = data?.nome ? `${data.nome} · TL Cifras` : "TL Cifras";
  }, [data?.nome]);

  useEffect(() => {
    getPublicPlaylistService(slug)
      .then(setData)
      .catch(() => setError("Playlist não encontrada ou o link foi desativado."));
  }, [slug]);

  const musicas = useMemo(
    () =>
      (data?.musicas || []).map((m) => {
        const st = data.toms?.[String(m.id)] || 0;
        const origKey = detectOriginalKey(m.descricao);
        return {
          ...m,
          st,
          tom: origKey ? getKeyAtOffset(origKey, st) : null,
          texto: transposeText(m.descricao || "", st),
        };
      }),
    // acc/simple mudam a saída de transposeText/getKeyAtOffset
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, acc, simple],
  );

  if (error) return <Page><p>{error}</p></Page>;
  if (!data) return <Page><p>Carregando…</p></Page>;

  return (
    <Page>
      <h1>{data.nome}</h1>
      <p className="meta">
        {musicas.length} música(s)
        {data.dataEvento && ` · ${new Date(data.dataEvento).toLocaleDateString("pt-BR")}`}
      </p>
      {musicas.length > 0 && (
        <button type="button" className="palco" onClick={() => setStageOpen(true)}>
          <FiMonitor size={18} aria-hidden="true" /> Modo palco
        </button>
      )}
      {musicas.map((m) => (
        <article key={m.id}>
          <h2>
            {m.nome}
            {m.tom && <span className="tom">Tom {m.tom}</span>}
          </h2>
          {m.artista && <p className="artista">{m.artista}</p>}
          <CifraRenderer text={m.texto} />
        </article>
      ))}
      {stageOpen && (
        <StageMode
          songs={musicas.map((m) => ({
            id: String(m.id),
            nome: m.nome,
            artista: m.artista,
            text: m.descricao,
            bpm: m.bpm,
          }))}
          semitones={Object.fromEntries(musicas.map((m) => [String(m.id), m.st]))}
          onSemitonesChange={() => {}}
          onClose={() => setStageOpen(false)}
        />
      )}
    </Page>
  );
}
