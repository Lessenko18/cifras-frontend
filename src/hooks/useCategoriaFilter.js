import { useMemo } from "react";

const parentIdOf = (cat) => cat.parent?._id || cat.parent;

// Dado o filtro de categoria escolhido, devolve os IDs a consultar (a própria
// categoria + suas subcategorias) e o texto exibido no botão do filtro.
// `showParent` acrescenta "· Categoria pai" no rótulo de uma subcategoria.
export function useCategoriaFilter(categorias, categoriaFiltro, { showParent = false } = {}) {
  const relevantCategoriaIds = useMemo(() => {
    if (!categoriaFiltro) return [];
    const ids = [categoriaFiltro];
    categorias.forEach((cat) => {
      if (String(parentIdOf(cat)) === categoriaFiltro) ids.push(cat._id);
    });
    return ids;
  }, [categoriaFiltro, categorias]);

  const filterLabel = useMemo(() => {
    if (!categoriaFiltro) return "Todas as categorias";
    const cat = categorias.find((c) => c._id === categoriaFiltro);
    if (!cat) return "Todas as categorias";
    const hasChildren = categorias.some((c) => String(parentIdOf(c)) === String(cat._id));
    if (hasChildren) return `${cat.nome} (todas)`;
    if (showParent && cat.parent?.nome) return `${cat.nome} · ${cat.parent.nome}`;
    return cat.nome;
  }, [categoriaFiltro, categorias, showParent]);

  return { relevantCategoriaIds, filterLabel };
}
