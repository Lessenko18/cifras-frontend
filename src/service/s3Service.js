import api from "./api";

export const MAX_AVATAR_SIZE_MB = 10;
export const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
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

export async function uploadToS3ViaBackend(file) {
  try {
    if (!file) {
      throw new Error("Arquivo não fornecido");
    }

    const imageSizeError = getImageSizeError(file);
    if (imageSizeError) {
      throw new Error(imageSizeError);
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/user/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const imageUrl =
      response.data?.imageUrl ||
      response.data?.Location ||
      response.data?.location ||
      response.headers?.location;

    if (!imageUrl) {
      throw new Error("URL da imagem não retornada pelo servidor");
    }

    return imageUrl; // Retorna a URL da imagem no S3
  } catch (err) {
    console.error("Erro ao fazer upload:", err);

    // Mensagens de erro mais específicas
    if (err.response?.status === 500) {
      throw new Error(
        "Erro no servidor ao processar upload. Verifique as configurações do S3 no backend.",
      );
    } else if (err.response?.status === 404) {
      throw new Error("Endpoint de upload não encontrado no backend.");
    } else if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error(err.message || "Erro ao fazer upload da imagem");
  }
}
