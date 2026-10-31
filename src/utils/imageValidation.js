// Validação de imagens enviadas pelo usuário (avatar e banner de playlist).
export const MAX_AVATAR_SIZE_MB = 10;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/avif",
];

export function getImageSizeError(file, maxSizeBytes = MAX_AVATAR_SIZE_BYTES) {
  if (!file) return null;

  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return "Formato inválido. Envie apenas arquivos de imagem.";
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.floor(maxSizeBytes / (1024 * 1024));
    return `A imagem excede o tamanho máximo de ${maxMb} MB.`;
  }

  return null;
}
