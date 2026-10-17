import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiTrash2, FiRotateCcw } from "react-icons/fi";
import { FeedbacksContainer, FeedbackCard, Filtros } from "./FeedbacksStyled";
import {
  deleteFeedbackService,
  getFeedbacksService,
  getFeedbackTipoLabel,
  setFeedbackLidoService,
} from "../../service/feedbackService";

const formatDate = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default function Feedbacks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendentes");

  const load = useCallback(async () => {
    try {
      setItems(await getFeedbacksService());
    } catch {
      toast.error("Erro ao carregar os relatos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleLido(item) {
    try {
      const updated = await setFeedbackLidoService(item._id, !item.lido);
      setItems((list) => list.map((f) => (f._id === item._id ? { ...f, lido: updated.lido } : f)));
    } catch {
      toast.error("Não foi possível atualizar.");
    }
  }

  async function remove(item) {
    if (!window.confirm("Excluir este relato?")) return;
    try {
      await deleteFeedbackService(item._id);
      setItems((list) => list.filter((f) => f._id !== item._id));
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  const pendentes = items.filter((f) => !f.lido).length;
  const visiveis = items.filter((f) =>
    filtro === "pendentes" ? !f.lido : filtro === "lidos" ? f.lido : true,
  );

  return (
    <FeedbacksContainer>
      <header>
        <h1>Relatos dos usuários</h1>
        <p className="sub">
          {pendentes} pendente{pendentes === 1 ? "" : "s"} · {items.length} no total
        </p>
      </header>

      <Filtros>
        {[
          ["pendentes", "Pendentes"],
          ["lidos", "Resolvidos"],
          ["todos", "Todos"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filtro === value ? "ativo" : ""}
            onClick={() => setFiltro(value)}
          >
            {label}
          </button>
        ))}
      </Filtros>

      {loading ? (
        <p className="vazio">Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p className="vazio">Nenhum relato por aqui.</p>
      ) : (
        visiveis.map((item) => (
          <FeedbackCard key={item._id} $lido={item.lido}>
            <div className="topo">
              <span className={`tipo tipo-${item.tipo}`}>{getFeedbackTipoLabel(item.tipo)}</span>
              <span className="data">{formatDate(item.createdAt)}</span>
            </div>

            {item.referencia && (
              <p className="ref">
                <strong>Sobre:</strong> {item.referencia}
              </p>
            )}

            <p className="mensagem">{item.mensagem}</p>

            <p className="autor">
              {item.user ? `${item.user.name} (${item.user.email})` : "Visitante"}
              {item.contato && ` · Contato: ${item.contato}`}
            </p>

            <div className="acoes">
              <button type="button" onClick={() => toggleLido(item)}>
                {item.lido ? <FiRotateCcw size={15} /> : <FiCheck size={15} />}
                {item.lido ? "Reabrir" : "Marcar como resolvido"}
              </button>
              <button type="button" className="excluir" onClick={() => remove(item)}>
                <FiTrash2 size={15} /> Excluir
              </button>
            </div>
          </FeedbackCard>
        ))
      )}
    </FeedbacksContainer>
  );
}
