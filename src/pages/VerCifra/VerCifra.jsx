import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMonitor } from "react-icons/fi";
import { deleteCifraService, editCifraService } from "../../service/cifraService";
import { UsersHeader } from "../Users/UsersStyled";
import { CifraBody, VerCifraContainer } from "./VerCifraStyled";
import { Title } from "../Playlist/PlaylistStyled";
import { detectKey, renderCifra } from "../../utils/cifraDoc";
import { getKeyAtOffset, useAccidental, useSimplify } from "../../utils/transpose";
import { exportCifraPdf } from "../../utils/pdfExport";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useMetronome } from "../../hooks/useMetronome";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useFontSize } from "../../hooks/useFontSize";
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

  const { cifra, setCifra, escolhidos, setEscolhidos, semitones, setSemitones, reload } = useCifraDetalhe(id);
  const canManageCifra = useCanManageCifra(cifra);

  const [update, setUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalTom, setModalTom] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [controlesVisiveis, setControlesVisiveis] = useState(true);

  const { scrolling, toggle: toggleScroll, slower, faster } = useAutoScroll();
  const [fontSize, changeFontSize] = useFontSize();
  const acc = useAccidental();
  const simple = useSimplify();

  useWakeLock();
  const metronome = useMetronome(90);

  // Assim que a cifra carrega, o metrônomo já nasce no BPM salvo pra ela
  useEffect(() => {
    if (cifra?.bpm) metronome.setBpm(cifra.bpm);
  }, [cifra?.bpm]);

  // Tonalidade original detectada a partir do primeiro acorde da cifra
  const originalKey = useMemo(
    () => detectKey({ text: cifra.observacao, chordpro: cifra.chordpro }),
    [cifra.observacao, cifra.chordpro],
  );

  // Tonalidade atual com grafia correta (sustenido ou bemol conforme a tonalidade)
  const currentKey = useMemo(
    () => getKeyAtOffset(originalKey, semitones),
    [originalKey, semitones, acc, simple],
  );

  // A cifra pronta para a tela e já transposta (calculada na renderização, sem alterar o banco).
  // Usa o ChordPro quando a cifra tem; senão o texto antigo, como sempre foi.
  const doc = useMemo(
    () => renderCifra({ text: cifra.observacao, chordpro: cifra.chordpro }, semitones),
    [cifra.observacao, cifra.chordpro, semitones, acc, simple],
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
      toast.success("Cifra atualizada com sucesso!");
      metronome.setBpm(data.bpm || 90);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao atualizar a cifra.");
    }
    setUpdate(false);
    reload();
  }

  async function handleSaveBpm() {
    if (!canManageCifra) return;
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
      tom: originalKey ? currentKey : null,
      bpm: cifra.bpm,
      text: doc.text,
    });
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
            aria-label="Abrir modo palco"
            title="Modo palco (tela cheia, letra grande)"
            onClick={() => setStageOpen(true)}
            style={{ color: "var(--text-primary)" }}
          >
            <FiMonitor size={24} />
          </button>
          <AddToPlaylist cifraId={cifraId} cifraNome={cifra.nome} />
          <button type="button" aria-label="Exportar cifra em PDF" onClick={handleExportPdf}>
            <img src="/pdf.svg" alt="Exportar PDF" title="Exportar PDF" />
          </button>
          {canManageCifra && (
            <button type="button" aria-label="Editar cifra" onClick={() => setUpdate(!update)}>
              <img src="/update.svg" alt="Update" title="editar" />
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
