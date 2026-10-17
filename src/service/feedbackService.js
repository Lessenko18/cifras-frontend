import api from "./api";

export const FEEDBACK_TIPOS = [
  { value: "cifra_errada", label: "Cifra com erro" },
  { value: "erro_app", label: "Algo errado no app" },
  { value: "melhoria", label: "Sugestão de melhoria" },
  { value: "outro", label: "Outro" },
];

export const getFeedbackTipoLabel = (tipo) =>
  FEEDBACK_TIPOS.find((t) => t.value === tipo)?.label || tipo;

export async function sendFeedbackService(data) {
  try {
    const response = await api.post("/feedback", data);
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao enviar. Tente novamente.";
  }
}

// ---- Somente ADM ----
export async function getFeedbacksService() {
  const response = await api.get("/feedback");
  return response.data || [];
}

export async function setFeedbackLidoService(id, lido) {
  const response = await api.patch(`/feedback/${id}/lido`, { lido });
  return response.data;
}

export async function deleteFeedbackService(id) {
  await api.delete(`/feedback/${id}`);
}
