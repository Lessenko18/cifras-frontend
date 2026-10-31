import { getImageSizeError } from "./imageValidation";
import {
  createPlaylistService,
  createPlaylistWithBannerService,
  editPlaylistService,
  editPlaylistWithBannerService,
} from "../service/playlistService";

// Lê o <form> de criar/editar playlist. Devolve { error } ou { data, bannerFile }.
// `cifraIds` vem do estado da tela (músicas escolhidas).
export function readPlaylistForm(form, cifraIds) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.nome?.trim()) return { error: "Informe o nome da playlist." };

  data.cifras = cifraIds;

  const bannerFile = data.banner instanceof File && data.banner.size > 0 ? data.banner : null;
  delete data.banner;
  if (bannerFile) {
    const sizeError = getImageSizeError(bannerFile);
    if (sizeError) return { error: sizeError };
  }

  return { data, bannerFile };
}

// Usa a rota com upload (multipart) só quando há capa nova.
export function submitCreatePlaylist(data, bannerFile) {
  return bannerFile
    ? createPlaylistWithBannerService({ ...data, bannerFile })
    : createPlaylistService(data);
}

export function submitEditPlaylist(id, data, bannerFile) {
  return bannerFile
    ? editPlaylistWithBannerService(id, { ...data, bannerFile })
    : editPlaylistService(id, data);
}
