import api from "./api";

const BUCKET_NAME = "cifras-caritas";
const REGION = "us-east-2";

export async function uploadToS3(file) {
  try {
    if (!file) {
      throw new Error("Arquivo não fornecido");
    }

    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `avatar-${timestamp}.${ext}`;

    // Pede ao backend uma URL pré-assinada do S3
    const presignedResponse = await api.post("/user/get-presigned-url", {
      fileName: fileName,
      fileType: file.type,
    });

    const presignedUrl = presignedResponse.data.presignedUrl;
    const imageUrl = presignedResponse.data.imageUrl;

    if (!presignedUrl) {
      throw new Error("Falha ao obter URL pré-assinada");
    }

    // Faz upload do arquivo direto no S3 usando a URL pré-assinada
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Erro ao fazer upload: ${uploadResponse.statusText}`);
    }

    return imageUrl; // Retorna a URL pública da imagem no S3
  } catch (err) {
    throw err;
  }
}

export async function uploadToS3ViaBackend(file) {
  try {
    if (!file) {
      throw new Error("Arquivo não fornecido");
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
