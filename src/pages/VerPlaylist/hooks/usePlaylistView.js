import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getPlaylistViewService, setPlaylistTomService } from "../../../service/playlistService";
import { hasOfflinePlaylist, loadOfflinePlaylist, saveOfflinePlaylist } from "../../../utils/offlinePlaylist";
import { getSavedTom, saveTom } from "../../../utils/tomStorage";
import { resolveInitialToms } from "../../../utils/playlistMusic";

// Carrega a playlist (da rede ou, sem sinal, da cópia offline) e guarda os tons
// por música. `onLoaded(data)` roda uma vez a cada carga (ex.: abrir o modo palco).
export function usePlaylistView(id, { onLoaded } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [publicSlug, setPublicSlug] = useState(null);
  // Transposição: { [songId]: semitones }
  const [toms, setToms] = useState({});
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr("");
    setFromCache(false);
    (async () => {
      try {
        let viewData;
        try {
          viewData = await getPlaylistViewService(id);
          // mantém a cópia offline atualizada quando há sinal
          if (hasOfflinePlaylist(id)) saveOfflinePlaylist(id, viewData);
        } catch (e) {
          // sem rede: usa a cópia salva neste aparelho, se existir
          const cached = !e.response && loadOfflinePlaylist(id);
          if (!cached) throw e;
          viewData = cached;
          if (!cancelled) setFromCache(true);
        }
        if (cancelled) return;
        setPublicSlug(viewData.publicSlug || null);
        setData(viewData);
        setToms(
          resolveInitialToms(viewData.musicas, viewData.toms, (sid) =>
            // `null` = nada salvo (diferente de 0, que é um tom salvo)
            getSavedTom(sid) || null,
          ),
        );
        onLoadedRef.current?.(viewData);
      } catch {
        if (!cancelled) setErr("Não foi possível carregar a playlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Atualiza o tom: salva na playlist (vale para todos) e mantém cópia local
  // como fallback caso a gravação falhe (ex.: offline).
  const updateTom = useCallback(
    (songId, semitones) => {
      setToms((prev) => ({ ...prev, [songId]: semitones }));
      saveTom(songId, semitones);
      setPlaylistTomService(id, String(songId), semitones).catch(() => {
        toast.error("Não foi possível salvar o tom na playlist.");
      });
    },
    [id],
  );

  return { data, loading, err, fromCache, publicSlug, setPublicSlug, toms, updateTom };
}
