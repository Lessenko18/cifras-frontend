import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";

// Quem criou a cifra pode vir em campos diferentes (dados antigos); o servidor
// continua sendo quem de fato autoriza — aqui só decide o que mostrar na tela.
function getOwnerId(cifra) {
  return (
    cifra?.criador?._id ||
    cifra?.criador ||
    cifra?.ownerId ||
    cifra?.userId ||
    cifra?.usuarioId ||
    cifra?.criadoPorId ||
    cifra?.createdById ||
    cifra?.owner?._id ||
    cifra?.user?._id ||
    cifra?.usuario?._id ||
    cifra?.criadoPor?._id ||
    cifra?.createdBy?._id ||
    cifra?.createdBy ||
    null
  );
}

export function useCanManageCifra(cifra) {
  const { user, isAdmin } = useAuth();
  const ownerId = getOwnerId(cifra);

  return useMemo(() => {
    if (isAdmin) return true;
    const userId = user?._id || user?.id;
    if (!userId || !ownerId) return false;
    return String(userId) === String(ownerId);
  }, [user, isAdmin, ownerId]);
}
