import { useCallback, useEffect, useRef, useState } from "react";
import { getCifraById, registerCifraAccessService } from "../../../service/cifraService";
import { getCategoriaById } from "../../../service/categoriaService";
import { getSavedTom, saveTom } from "../../../utils/tomStorage";
import { wrapSemitones } from "../../../utils/transpose";
import { loadCifraCache, saveCifraCache } from "../../../utils/offlineCifra";
import { pushRecentCifra } from "../../../utils/recentCifras";

const EMPTY_CIFRA = {};

function loadErrorMessage(err) {
  if (err?.response?.status === 404) return "Cifra não encontrada. Ela pode ter sido excluída.";
  return "Não foi possível carregar a cifra. Verifique sua conexão e tente de novo.";
}

// Tudo que a página de uma cifra precisa de dados: a cifra, as categorias dela,
// o tom salvo neste aparelho, o registro de acesso e o "recentes" da Home.
// `status`: "loading" | "ok" | "error" (com `erro` explicando). A cifra e o status
// pertencem a um `id`: ao trocar de cifra nunca aparece a anterior.
export function useCifraDetalhe(id) {
  const [cifraState, setCifraState] = useState({ id, data: EMPTY_CIFRA });
  const [loadState, setLoadState] = useState({ id, status: "loading", erro: "" });
  const [escolhidos, setEscolhidos] = useState([]);
  // O tom pertence a um `id`. Ao trocar de cifra, o valor vem do aparelho já na
  // mesma renderização — assim o efeito de gravar nunca escreve o tom da cifra
  // anterior (ou 0, antes de ler) por cima do tom salvo desta.
  const [tom, setTom] = useState(() => ({ id, value: getSavedTom(id) }));
  const semitones = tom.id === id ? tom.value : getSavedTom(id);
  const setSemitones = useCallback((value) => setTom({ id, value: wrapSemitones(value) }), [id]);
  const accessRegisteredRef = useRef(null);
  const latestIdRef = useRef(id);
  latestIdRef.current = id;

  const cifra = cifraState.id === id ? cifraState.data : EMPTY_CIFRA;
  const status = loadState.id === id ? loadState.status : "loading";
  const erro = loadState.id === id ? loadState.erro : "";

  const setCifra = useCallback(
    (next) =>
      setCifraState((prev) => {
        const current = prev.id === id ? prev.data : EMPTY_CIFRA;
        return { id, data: typeof next === "function" ? next(current) : next };
      }),
    [id],
  );

  // Busca a cifra e as categorias. Nunca lança: devolve `true` se deu certo.
  // `silent` = recarga depois de editar (não troca a tela por "carregando").
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoadState({ id, status: "loading", erro: "" });
      try {
        let data;
        try {
          data = (await getCifraById(id)).data;
          saveCifraCache(id, data); // para reabrir sem sinal
        } catch (err) {
          // sem rede (não houve resposta do servidor): usa a cópia deste aparelho, se houver
          data = !err.response && loadCifraCache(id);
          if (!data) throw err;
        }
        if (latestIdRef.current !== id) return false; // chegou depois de trocar de cifra
        setCifraState({ id, data });
        setLoadState({ id, status: "ok", erro: "" });

        // Em paralelo; uma categoria que falhe não derruba a cifra
        const categorias = await Promise.all(
          (data.categorias || []).map((categoria) =>
            getCategoriaById(categoria).then(
              (r) => r.data,
              () => null,
            ),
          ),
        );
        if (latestIdRef.current !== id) return false;
        setEscolhidos(categorias.filter(Boolean));
        return true;
      } catch (err) {
        if (latestIdRef.current !== id) return false;
        if (!silent) setLoadState({ id, status: "error", erro: loadErrorMessage(err) });
        return false;
      }
    },
    [id],
  );

  useEffect(() => {
    setEscolhidos([]);
    load();
  }, [load]);

  const retry = useCallback(() => load(), [load]);
  const reload = useCallback(() => load({ silent: true }), [load]);

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

  return { cifra, setCifra, status, erro, retry, escolhidos, setEscolhidos, semitones, setSemitones, reload };
}
