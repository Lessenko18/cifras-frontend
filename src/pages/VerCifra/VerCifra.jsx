import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiDownload, FiEdit2, FiMonitor } from "react-icons/fi";
import { deleteCifraService, editCifraService } from "../../service/cifraService";
import { CifraBody, VerCifraContainer } from "./VerCifraStyled";
import { UsersHeader, Title } from "../../components/PageHeader/PageHeaderStyled";
import { detectKey, detectMinor, renderCifra } from "../../utils/cifraDoc";
import { getLocalBpm, saveLocalBpm } from "../../utils/bpmStorage";
import { shapeSemitones, useCapo } from "../../utils/capoStorage";
import { getKeyAtOffset, useAccidental, useSimplify } from "../../utils/transpose";
import { exportCifraPdf } from "../../utils/pdfExport";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useMetronome } from "../../hooks/useMetronome";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useFontSize } from "../../hooks/useFontSize";
import { SkeletonPage } from "../../components/Skeleton/Skeleton";
import AddToPlaylist from "../../components/AddToPlaylist/AddToPlaylist";
import StageMode from "../../components/StageMode/StageMode";
import { useCifraDetalhe } from "./hooks/useCifraDetalhe";
import { useCanManageCifra } from "./hooks/useCanManageCifra";
import ControlesLeitura from "./components/ControlesLeitura";
import LeituraCifra from "./components/LeituraCifra";
import EditarCifraForm from "./components/EditarCifraForm";
import TomModal from "../../components/TomModal/TomModal";
import ConfirmarExclusao from "./components/ConfirmarExclusao";

export default function VerCifra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { cifra, setCifra, status, erro, retry, escolhidos, setEscolhidos, semitones, setSemitones, reload } =
    useCifraDetalhe(id);
  const canManageCifra = useCanManageCifra(cifra);

  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalTom, setModalTom] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [controlesVisiveis, setControlesVisiveis] = useState(true);

  const { scrolling, toggle: toggleScroll, slower, faster } = useAutoScroll({ levelKey: `scroll_${id}` });
  const [fontSize, changeFontSize] = useFontSize();
  const acc = useAccidental();
  const simple = useSimplify();
  const capo = useCapo(id);

  useWakeLock();
  const metronome = useMetronome(90);
  const setMetronomeBpm = metronome.setBpm;

  // Assim que a cifra carrega, o metrônomo já nasce no BPM salvo pra ela. Quem não pode
  // editar a cifra pode ter um BPM só seu, guardado neste aparelho.
  useEffect(() => {
    const bpm = (!canManageCifra && getLocalBpm(id)) || cifra?.bpm;
    if (bpm) setMetronomeBpm(bpm);
  }, [id, cifra?.bpm, canManageCifra, setMetronomeBpm]);

  // Tonalidade original detectada a partir do primeiro acorde da cifra
  const originalKey = useMemo(
    () => detectKey({ text: cifra.observacao, chordpro: cifra.chordpro }),
    [cifra.observacao, cifra.chordpro],
  );

  // Tom menor (Am, Em...): mostra o "m" junto da nota
  const minor = useMemo(
    () => detectMinor({ text: cifra.observacao, chordpro: cifra.chordpro }),
    [cifra.observacao, cifra.chordpro],
  );

  // Tonalidade atual com grafia correta (sustenido ou bemol conforme a preferência)
  const currentKey = useMemo(
    () => getKeyAtOffset(originalKey, semitones, acc),
    [originalKey, semitones, acc],
  );

  // Com capo, a tela mostra as formas de acorde (o tom acima continua sendo o que soa)
  const formaKey = capo ? getKeyAtOffset(originalKey, shapeSemitones(semitones, capo), acc) : null;

  // A cifra pronta para a tela e já transposta (calculada na renderização, sem alterar o banco).
  // Usa o ChordPro quando a cifra tem; senão o texto antigo, como sempre foi.
  const doc = useMemo(
    () =>
      renderCifra({ text: cifra.observacao, chordpro: cifra.chordpro }, shapeSemitones(semitones, capo), {
        accidental: acc,
        simplify: simple,
      }),
    [cifra.observacao, cifra.chordpro, semitones, capo, acc, simple],
  );
  const twoColumns = doc.columns.length === 2; // um único "!!!" no texto = duas colunas
  const cifraId = String(cifra._id || id);

  useEffect(() => {
    if (!canManageCifra) {
      setUpdate(false);
      setModalDelete(false);
    }
  }, [canManageCifra]);

  async function handleUpdateCifra(event) {
    event.preventDefault();

    if (!canManageCifra) {
      toast.error("Você não tem permissão para editar esta cifra.");
      setUpdate(false);
      return;
    }

    const data = Object.fromEntries(new FormData(event.target).entries());
    data.categorias = escolhidos.map((c) => c._id);
    if (data.bpm === "") delete data.bpm;
    else data.bpm = Number(data.bpm);
    try {
      await editCifraService(id, data);
    } catch (err) {
      // Mantém o formulário aberto: o que foi digitado não se perde
      console.error(err);
      toast.error(err.response?.data?.message || "Falha ao atualizar a cifra. Suas alterações continuam na tela.");
      return;
    }
    toast.success("Cifra atualizada com sucesso!");
    metronome.setBpm(data.bpm || 90);
    setUpdate(false);
    if (!(await reload())) toast.error("Salvo, mas não foi possível atualizar a tela. Recarregue a página.");
  }

  async function handleSaveBpm() {
    if (!canManageCifra) {
      saveLocalBpm(id, metronome.bpm);
      toast.success("BPM salvo neste aparelho!");
      return;
    }
    try {
      await editCifraService(id, { bpm: metronome.bpm });
      setCifra((c) => ({ ...c, bpm: metronome.bpm }));
      toast.success("BPM salvo na cifra!");
    } catch {
      toast.error("Falha ao salvar o BPM.");
    }
  }

  async function handleDeleteCifra() {
    if (!canManageCifra) {
      toast.error("Você não tem permissão para excluir esta cifra.");
      setModalDelete(false);
      return;
    }

    try {
      await deleteCifraService(id);
      toast.success("Cifra excluída com sucesso!");
      navigate("/home/cifras");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao excluir a cifra");
    }
  }

  function handleExportPdf() {
    exportCifraPdf({
      nome: cifra.nome,
      artista: cifra.artista,
      tom: originalKey ? currentKey + (minor ? "m" : "") : null,
      capo,
      bpm: cifra.bpm,
      text: doc.text,
    });
  }

  if (status === "loading") return <SkeletonPage />;

  if (status === "error") {
    return (
      <VerCifraContainer>
        <div role="alert" style={{ textAlign: "center", padding: "48px 16px", display: "grid", gap: 16, justifyItems: "center" }}>
          <p style={{ margin: 0, color: "var(--text-primary)" }}>{erro}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn" onClick={retry}>
              Tentar de novo
            </button>
            <button type="button" className="btn" onClick={() => navigate("/home/cifras")}>
              Ver todas as cifras
            </button>
          </div>
        </div>
      </VerCifraContainer>
    );
  }

  return (
    <VerCifraContainer className={twoColumns && "partes"}>
      <UsersHeader>
        <div className="ver-cifra-left">
          <button type="button" aria-label="Voltar" className="ver-cifra-back" onClick={() => navigate(-1)}>
            <img src="/back.svg" alt="Voltar" title="Voltar" className="img-hover" />
          </button>
        </div>
        <Title>{cifra.nome}</Title>
        <div className="btns-header">
          <button
            type="button"
            className="hdr-btn"
            aria-label="Abrir modo palco"
            title="Modo palco (tela cheia, letra grande)"
            onClick={() => setStageOpen(true)}
          >
            <FiMonitor aria-hidden="true" />
          </button>
          <AddToPlaylist className="hdr-btn" cifraId={cifraId} cifraNome={cifra.nome} />
          <button type="button" className="hdr-btn" aria-label="Exportar cifra em PDF" title="Exportar PDF" onClick={handleExportPdf}>
            <FiDownload aria-hidden="true" />
          </button>
          {canManageCifra && (
            <button type="button" className="hdr-btn" aria-label="Editar cifra" title="Editar cifra" onClick={() => setUpdate(!update)}>
              <FiEdit2 aria-hidden="true" />
            </button>
          )}
        </div>
      </UsersHeader>

      {controlesVisiveis && (
        <ControlesLeitura
          scrolling={scrolling}
          onToggleScroll={toggleScroll}
          onSlower={slower}
          onFaster={faster}
          onFontSize={changeFontSize}
          metronome={metronome}
          canSaveBpm={canManageCifra}
          onSaveBpm={handleSaveBpm}
          onHide={() => setControlesVisiveis(false)}
        />
      )}

      <CifraBody>
        {!update || !canManageCifra ? (
          <LeituraCifra
            cifra={cifra}
            cifraId={cifraId}
            doc={doc}
            twoColumns={twoColumns}
            originalKey={originalKey}
            currentKey={currentKey}
            minor={minor}
            capo={capo}
            formaKey={formaKey}
            fontSize={fontSize}
            controlesVisiveis={controlesVisiveis}
            onOpenTom={() => setModalTom(true)}
            onToggleControles={() => setControlesVisiveis((v) => !v)}
          />
        ) : (
          <EditarCifraForm
            cifra={cifra}
            escolhidos={escolhidos}
            onChangeEscolhidos={setEscolhidos}
            onSubmit={handleUpdateCifra}
            onRequestDelete={() => setModalDelete(true)}
          />
        )}
      </CifraBody>

      {modalTom && originalKey && (
        <TomModal
          currentKey={currentKey}
          cifraId={id}
          originalKey={originalKey}
          minor={minor}
          accidental={acc}
          semitones={semitones}
          onChange={setSemitones}
          onClose={() => setModalTom(false)}
        />
      )}

      {modalDelete && (
        <ConfirmarExclusao nome={cifra.nome} onCancel={() => setModalDelete(false)} onConfirm={handleDeleteCifra} />
      )}

      {stageOpen && (
        <StageMode
          songs={[
            {
              id: cifraId,
              nome: cifra.nome,
              artista: cifra.artista,
              text: cifra.observacao,
              chordpro: cifra.chordpro,
              bpm: cifra.bpm,
            },
          ]}
          semitones={{ [cifraId]: semitones }}
          onSemitonesChange={(_, n) => setSemitones(n)}
          onClose={() => setStageOpen(false)}
        />
      )}
    </VerCifraContainer>
  );
}
