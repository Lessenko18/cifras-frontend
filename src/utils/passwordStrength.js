// Força da senha só para orientar quem está se cadastrando (a regra que vale é o mínimo
// de caracteres, validado também no servidor). Devolve { score: 0-4, label }.
const LABELS = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const COMMON = new Set(["12345678", "123456789", "1234567890", "password", "senha123", "qwertyui", "11111111", "abc12345"]);

export function passwordStrength(password) {
  const value = String(password ?? "");
  if (!value) return { score: 0, label: "" };
  if (COMMON.has(value.toLowerCase())) return { score: 0, label: LABELS[0] };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  else if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += value.length >= 10 ? 1 : 0;

  // Abaixo do mínimo nunca passa de "fraca"
  if (value.length < 8) score = Math.min(score, 1);
  score = Math.min(score, 4);
  return { score, label: LABELS[score] };
}
