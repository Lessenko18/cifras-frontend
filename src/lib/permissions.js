// Único lugar do front que decide "quem pode ver/fazer o quê" na interface. O servidor
// continua sendo quem de fato autoriza (backend/src/policies); aqui só escolhe o que mostrar.
// Plano pago entra como mais uma regra desta tabela (ex.: "tuner:use"), sem tocar nas telas.
export const ROLES = Object.freeze({ USER: "USER", ADM: "ADM" });

const isAdminUser = (user) => String(user?.level || "").toUpperCase() === ROLES.ADM;
const userIdOf = (user) => user?._id || user?.id || null;
const sameId = (a, b) => Boolean(a) && Boolean(b) && String(a) === String(b);

const RULES = {
  "admin:access": (user) => isAdminUser(user),
  // resource: { ownerId } — dono (ou ADM) gerencia
  "cifra:manage": (user, r) => isAdminUser(user) || sameId(userIdOf(user), r?.ownerId),
  "playlist:manage-share": (user, r) => isAdminUser(user) || sameId(userIdOf(user), r?.ownerId),
};

export function can(user, action, resource) {
  const rule = RULES[action];
  if (!rule) throw new Error(`Ação desconhecida: ${action}`);
  return Boolean(user) && rule(user, resource);
}
