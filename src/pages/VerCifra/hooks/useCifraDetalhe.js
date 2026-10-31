import { useCallback, useEffect, useRef, useState } from "react";
import { getCifraById, registerCifraAccessService } from "../../../service/cifraService";
import { getCategoriaById } from "../../../service/categoriaService";
import { getSavedTom, saveTom } from "../../../utils/tomStorage";
import { pushRecentCifra } from "../../../utils/recentCifras";

// Tudo que a página de uma cifra precisa de dados: a cifra, as categorias dela,
// o tom salvo neste aparelho, o registro de acesso e o "recentes" da Home.
export function useCifraDetalhe(id) {
  const [cifra, setCifra] = useState({});
  const [escolhidos, setEscolhidos] = useState([]);
  // O tom pertence a um `id`. Ao trocar de cifra, o valor vem do aparelho já na
  // mesma renderização — assim o efeito de gravar nunca escreve o tom da cifra
  // anterior (ou 0, antes de ler) por cima do tom salvo desta.
  const [tom, setTom] = useState(() => ({ id, value: getSavedTom(id) }));
  const semitones = tom.id === id ? tom.value : getSavedTom(id);
  const setSemitones = useCallback((value) => setTom({ id, value }), [id]);
  const accessRegisteredRef = useRef(null);
  const latestIdRef = useRef(id);
  latestIdRef.current = id;

  const reload = useCallback(async () => {
    const response = await getCifraById(id);
    if (latestIdRef.current !== id) return; // chegou depois de trocar de cifra
    setCifra(response.data);

    const categorias = [];
    for (const categoria of response.data.categorias) {
      const responseCat = await getCategoriaById(categoria);
      categorias.push(responseCat.data);
    }
    if (latestIdRef.current !== id) return;
    setEscolhidos(categorias);
  }, [id]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  // Persiste o tom escolhido por música no aparelho (0 = original: apaga)
  useEffect(() => {
    if (id && tom.id === id) saveTom(id, tom.value);
  }, [tom, id]);

  // Registra o acesso uma única vez por música, mesmo com o double-invoke de efeitos do StrictMode
  useEffect(() => {
    if (!id || accessRegisteredRef.current === id) return;
    accessRegisteredRef.current = id;
    registerCifraAccessService(id).catch(() => {});
  }, [id]);

  // Lembra as últimas cifras abertas (Recentes na Home)
  useEffect(() => {
    if (cifra?.nome) pushRecentCifra({ id: cifra._id || id, nome: cifra.nome, artista: cifra.artista });
  }, [id, cifra?._id, cifra?.nome, cifra?.artista]);

  return { cifra, setCifra, escolhidos, setEscolhidos, semitones, setSemitones, reload };
}
