import { useState } from "react";
import toast from "react-hot-toast";
import { createCifraService } from "../../../service/cifraService";
import { parseCifraClubUrl } from "../../../utils/parseCifraClubUrl";
import { Input } from "../../../components/Input/Input";
import MultSeletor from "../../../components/MultSeletor/MultSeletor";
import { CloseX, ModalCifra, ModalOverlay } from "../CifraStyled";

// Modal "Adicionar Nova Cifra". O estado do formulário vive aqui: fechar o modal
// (desmontar) já descarta o rascunho.
export default function NovaCifraModal({ onClose, onCreated }) {
  const [nome, setNome] = useState("");
  const [artista, setArtista] = useState("");
  const [link, setLink] = useState("");
  const [bpm, setBpm] = useState("");
  const [observacao, setObservacao] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [sending, setSending] = useState(false);

  // Preenche título e artista a partir do link do CifraClub (não faz requisição)
  function handleFillFromLink() {
    if (!link.trim()) {
      toast.warning("Cole o link da cifra primeiro.");
      return;
    }
    try {
      const parsed = parseCifraClubUrl(link.trim());
      if (parsed.nome) setNome(parsed.nome);
      if (parsed.artista) setArtista(parsed.artista);
      toast.success("Cifra carregada com sucesso!");
    } catch {
      toast.error("Não foi possível carregar a cifra. Verifique o link.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!nome.trim()) {
      toast.warning("Preencha o título da música.");
      return;
    }

    setSending(true);
    try {
      await createCifraService({
        nome: nome.trim(),
        link: link.trim() || undefined,
        observacao: observacao.trim(),
        artista: artista.trim(),
        bpm: bpm.trim() ? Number(bpm.trim()) : undefined,
        categorias: categorias.map((c) => c._id),
      });
      await onCreated();
      toast.success("Cifra cadastrada com sucesso!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.status === 409
          ? err.response.data?.message || "Essa cifra já existe."
          : "Falha ao cadastrar a cifra.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <ModalOverlay onClick={onClose} />

      <ModalCifra onSubmit={handleSubmit}>
        <CloseX type="button" onClick={onClose}>
          ×
        </CloseX>

        <h3>Adicionar Nova Cifra</h3>

        <div>
          <label htmlFor="cifra-nome">Título da Música *</label>
          <Input
            id="cifra-nome"
            name="nome"
            required
            placeholder="Preencha o nome da música"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="cifra-artista">Artista</label>
          <Input
            id="cifra-artista"
            name="artista"
            placeholder="Nome do artista (opcional)"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="cifra-bpm">BPM (batidas por minuto)</label>
          <Input
            id="cifra-bpm"
            name="bpm"
            type="number"
            min={30}
            max={300}
            placeholder="Ex: 90 (opcional, dá pra ajustar depois)"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="cifra-link">Link da Cifra</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Input
              id="cifra-link"
              name="link"
              type="url"
              placeholder="https://exemplo.com.br/sua-cifra (opcional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={handleFillFromLink}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Buscar
            </button>
          </div>
        </div>

        <p>Utilize "!!!" para separar a cifra em duas colunas</p>

        <div>
          <label htmlFor="cifra-observacao">Cifra</label>
          <textarea
            id="cifra-observacao"
            name="observacao"
            placeholder={`Cole sua cifra aqui:\n      Am\nDoente de amor procurei remédio\n     G\nNa vida noturna`}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        <MultSeletor tipo="categoria" escolhidos={categorias} addItem={setCategorias} />

        <div className="actions modal-actions">
          <button type="button" className="btn btn-danger" onClick={onClose}>
            Cancelar
          </button>
          {!sending ? (
            <button type="submit" className="btn">
              Adicionar
            </button>
          ) : (
            <p className="btn">Enviando</p>
          )}
        </div>
      </ModalCifra>
    </>
  );
}
