import { useState } from "react";
import toast from "react-hot-toast";
import { FiDownloadCloud, FiLink, FiMonitor } from "react-icons/fi";
import { setPlaylistPublicLinkService } from "../../../service/playlistService";
import { getPublicAppUrl } from "../../../utils/getPublicAppUrl";
import { hasOfflinePlaylist, removeOfflinePlaylist, saveOfflinePlaylist } from "../../../utils/offlinePlaylist";
import { Header } from "../VerPlaylistStyled";

// Título da playlist e ações: link público, cópia offline, modo palco e PDF.
export default function PlaylistHeader({
  playlistId,
  data,
  publicSlug,
  onPublicSlugChange,
  fromCache,
  onOpenStage,
  onExportPdf,
}) {
  const [offlineSaved, setOfflineSaved] = useState(() => hasOfflinePlaylist(playlistId));
  const temMusicas = (data.musicas?.length || 0) > 0;

  async function togglePublicLink() {
    try {
      const { publicSlug: slug } = await setPlaylistPublicLinkService(playlistId, !publicSlug);
      onPublicSlugChange(slug);
      if (!slug) {
        toast.success("Link público desativado.");
        return;
      }
      const url = `${getPublicAppUrl()}/p/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link público copiado!");
      } catch {
        toast.success(`Link público: ${url}`, { duration: 8000 });
      }
    } catch {
      toast.error("Não foi possível alterar o link público.");
    }
  }

  function copyPublicLink() {
    navigator.clipboard
      ?.writeText(`${getPublicAppUrl()}/p/${publicSlug}`)
      .then(() => toast.success("Link copiado!"))
      .catch(() => toast.error("Não foi possível copiar."));
  }

  function toggleOffline() {
    if (offlineSaved) {
      removeOfflinePlaylist(playlistId);
      setOfflineSaved(false);
      toast.success("Cópia offline removida.");
    } else if (saveOfflinePlaylist(playlistId, data)) {
      setOfflineSaved(true);
      toast.success("Playlist disponível offline neste aparelho.");
    } else {
      toast.error("Não foi possível salvar offline (armazenamento cheio).");
    }
  }

  return (
    <Header>
      <h2>{data.nome}</h2>
      <span>{data.musicas?.length || 0} música(s)</span>
      {data.podeCompartilharLink && (
        <button
          type="button"
          className="export-pdf"
          aria-pressed={Boolean(publicSlug)}
          title="Gera um link somente leitura para enviar aos músicos (WhatsApp)"
          onClick={togglePublicLink}
        >
          <FiLink size={18} />
          {publicSlug ? "Desativar link" : "Link público"}
        </button>
      )}
      {publicSlug && (
        <button type="button" className="export-pdf" onClick={copyPublicLink}>
          Copiar link
        </button>
      )}
      {fromCache && <span role="status">Modo offline: dados salvos neste aparelho</span>}
      <button
        type="button"
        className="export-pdf"
        aria-pressed={offlineSaved}
        title="Guarda as cifras e o tom desta playlist neste aparelho para usar sem internet"
        onClick={toggleOffline}
      >
        <FiDownloadCloud size={18} />
        {offlineSaved ? "Offline ✓" : "Salvar offline"}
      </button>
      {temMusicas && (
        <button type="button" className="export-pdf" aria-label="Abrir modo palco" onClick={onOpenStage}>
          <FiMonitor size={18} />
          Modo palco
        </button>
      )}
      {temMusicas && (
        <button type="button" className="export-pdf" aria-label="Exportar playlist em PDF" onClick={onExportPdf}>
          <img src="/pdf.svg" alt="Exportar PDF" title="Exportar playlist em PDF" />
          Exportar PDF
        </button>
      )}
    </Header>
  );
}
