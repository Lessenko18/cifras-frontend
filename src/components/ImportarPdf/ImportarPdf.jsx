import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createCifraService,
  getCifrasService,
} from "../../service/cifraService";
import { normalize, parsePages, readPdfPages } from "../../utils/pdfImport";
import { CifraRenderer } from "../CifraRenderer/CifraRenderer";
import { CloseX, ModalOverlay } from "../../pages/Cifras/CifraStyled";
import { Avisos, Cartao, Painel } from "./ImportarPdfStyled";

// Cifras já cadastradas com o mesmo título (de qualquer artista), pra avisar na revisão.
async function buscarExistentes(nome) {
  try {
    const res = await getCifrasService({ nome, limit: 30 });
    const alvo = normalize(nome);
    return (res.data?.cifras || []).filter((c) => normalize(c.nome) === alvo);
  } catch {
    return [];
  }
}

export default function ImportarPdf({ categorias, onClose, onImported }) {
  const inputRef = useRef(null);
  const [etapa, setEtapa] = useState("escolher"); // escolher | lendo | revisao | salvando
  const [musicas, setMusicas] = useState([]);
  const [avisos, setAvisos] = useState([]);

  const opcoesCategoria = useMemo(() => {
    const porId = new Map(categorias.map((c) => [c._id, c]));
    return categorias
      .map((c) => {
        const paiId = typeof c.parent === "string" ? c.parent : c.parent?._id;
        const pai = c.parent?.nome || porId.get(paiId)?.nome;
        return { id: c._id, label: pai ? `${pai} › ${c.nome}` : c.nome };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categorias]);

  const atualizar = (id, campos) =>
    setMusicas((lista) =>
      lista.map((m) => (m.id === id ? { ...m, ...campos } : m)),
    );

  async function handleArquivo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setEtapa("lendo");
    try {
      const paginas = await readPdfPages(file);
      const { songs, avisos: av } = parsePages(paginas, categorias);
      if (!songs.length) {
        toast.error("Não encontrei nenhuma cifra com texto nesse PDF.");
        setAvisos(av);
        setEtapa("escolher");
        return;
      }
      const existentes = await Promise.all(
        songs.map((s) => buscarExistentes(s.nome)),
      );
      setMusicas(
        songs.map((s, i) => ({
          ...s,
          existentes: existentes[i],
          selecionada: !existentes[i].length && s.temAcordes,
        })),
      );
      setAvisos(av);
      setEtapa("revisao");
    } catch (err) {
      console.error(err);
      toast.error("Não consegui ler esse PDF.");
      setEtapa("escolher");
    }
  }

  async function handleImportar() {
    const escolhidas = musicas.filter((m) => m.selecionada && m.nome.trim());
    if (!escolhidas.length) {
      toast.warning("Marque pelo menos uma música com título.");
      return;
    }
    setEtapa("salvando");
    let ok = 0;
    const falhas = [];
    const repetidas = [];
    for (const m of escolhidas) {
      try {
        await createCifraService({
          nome: m.nome.trim(),
          artista: m.artista.trim(),
          observacao: m.texto.trim(),
          categorias: m.categoriaId ? [m.categoriaId] : [],
        });
        ok++;
      } catch (err) {
        if (err?.response?.status === 409) {
          repetidas.push(m.nome);
        } else {
          console.error(err);
          falhas.push(m.nome);
        }
      }
    }
    if (ok) toast.success(`${ok} cifra(s) importada(s)!`);
    if (repetidas.length)
      toast.error(
        `Já existiam (mesmo título e artista), não importadas: ${repetidas.join(", ")}`,
      );
    if (falhas.length) toast.error(`Falhou: ${falhas.join(", ")}`);
    if (ok) await onImported?.();
    const pendentes = [...falhas, ...repetidas];
    if (pendentes.length) {
      setMusicas((l) =>
        l
          .filter((m) => pendentes.includes(m.nome))
          .map((m) => ({ ...m, selecionada: false })),
      );
      setEtapa("revisao");
    } else {
      onClose();
    }
  }

  const totalSelecionadas = musicas.filter((m) => m.selecionada).length;

  return (
    <>
      <ModalOverlay onClick={etapa === "salvando" ? undefined : onClose} />
      <Painel>
        <CloseX type="button" onClick={onClose} disabled={etapa === "salvando"}>
          ×
        </CloseX>
        <h3>Importar cifras de PDF</h3>

        {(etapa === "escolher" || etapa === "lendo") && (
          <>
            <p>
              Escolha um PDF com texto. Pode ter várias músicas no mesmo
              arquivo. Você confere tudo antes de salvar.
            </p>
            {avisos.length > 0 && (
              <Avisos>
                {avisos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </Avisos>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleArquivo}
            />
            <div className="actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                disabled={etapa === "lendo"}
                onClick={() => inputRef.current?.click()}
              >
                {etapa === "lendo" ? "Lendo PDF..." : "Escolher PDF"}
              </button>
            </div>
          </>
        )}

        {(etapa === "revisao" || etapa === "salvando") && (
          <>
            <p>
              {musicas.length} música(s) encontrada(s). Revise nome, artista e
              categoria; abra "Cifra" para ajustar o texto.
            </p>
            {avisos.length > 0 && (
              <Avisos>
                {avisos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </Avisos>
            )}

            {musicas.map((m) => (
              <Cartao key={m.id} $off={!m.selecionada}>
                <div className="topo">
                  <input
                    type="checkbox"
                    checked={m.selecionada}
                    onChange={(e) =>
                      atualizar(m.id, { selecionada: e.target.checked })
                    }
                  />
                  <span>{m.nome || "Sem título"}</span>
                  <span className="selo">pág. {m.paginas.join(", ")}</span>
                  {m.momento && (
                    <span className="selo">{m.momento.toLowerCase()}</span>
                  )}
                  {m.existentes.length > 0 && (
                    <span className="selo alerta">
                      já existe no app
                      {m.existentes.some((c) => c.artista) ? ": " : ""}
                      {m.existentes
                        .map((c) => c.artista)
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                  {!m.temAcordes && (
                    <span className="selo alerta">sem acordes</span>
                  )}
                </div>

                <div className="campos">
                  <label>
                    Título
                    <input
                      type="text"
                      value={m.nome}
                      onChange={(e) =>
                        atualizar(m.id, { nome: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Artista
                    <input
                      type="text"
                      value={m.artista}
                      onChange={(e) =>
                        atualizar(m.id, { artista: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      value={m.categoriaId}
                      onChange={(e) =>
                        atualizar(m.id, { categoriaId: e.target.value })
                      }
                    >
                      <option value="">(sem categoria)</option>
                      {opcoesCategoria.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <details>
                  <summary>Cifra</summary>
                  <div>
                    <textarea
                      value={m.texto}
                      spellCheck={false}
                      onChange={(e) =>
                        atualizar(m.id, { texto: e.target.value })
                      }
                    />
                    <CifraRenderer text={m.texto} />
                  </div>
                </details>
              </Cartao>
            ))}

            <div className="actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={onClose}
                disabled={etapa === "salvando"}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleImportar}
                disabled={etapa === "salvando" || !totalSelecionadas}
              >
                {etapa === "salvando"
                  ? "Importando..."
                  : `Importar ${totalSelecionadas} selecionada(s)`}
              </button>
            </div>
          </>
        )}
      </Painel>
    </>
  );
}
