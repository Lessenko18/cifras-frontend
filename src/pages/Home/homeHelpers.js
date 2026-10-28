// Funções puras da Home (ordenação, formatação, iniciais), sem React.

export const sortByNome = (a, b) =>
  (a?.nome || "").localeCompare(b?.nome || "", "pt-BR", { sensitivity: "base" });

export const AVATAR_PALETTE = ["#7c3aed", "#0ea5e9", "#f59e0b", "#14b8a6", "#6366f1", "#ec4899"];

export const formatCount = (n) => {
  if (!n) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
};

export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return null;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(dateStr))) / 86400000);
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return `${diffDays} dias`;
};

export const getInitials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// tira o emoji de música que algumas playlists antigas trazem no começo do nome
export const stripEmoji = (v) =>
  typeof v === "string" ? v.replace(/^[\s]*(?:🎵|🎶|♪|♫)\s*/u, "") : v || "";
