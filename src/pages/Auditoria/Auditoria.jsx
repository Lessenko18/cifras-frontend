import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuditContainer, Toolbar, Row, Pager } from "./AuditoriaStyled";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonRows } from "../../components/Skeleton/Skeleton";
import { useSearch } from "../../hooks/useSearch";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  getAuditLogsService,
} from "../../service/auditService";

const formatDate = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default function Auditoria() {
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(0);
  const { search, setSearch, debounced } = useSearch(300, "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAuditLogsService({ page, entity, q: debounced }));
    } catch {
      toast.error("Erro ao carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }, [page, entity, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  // Volta pra primeira página quando o filtro muda
  useEffect(() => {
    setPage(0);
  }, [entity, debounced]);

  return (
    <AuditContainer>
      <header>
        <h1>Histórico de ações</h1>
        <p className="sub">
          Quem criou, editou ou excluiu o quê. Registros ficam guardados por 180 dias.
        </p>
      </header>

      <Toolbar>
        <select value={entity} onChange={(e) => setEntity(e.target.value)} aria-label="Filtrar por tipo">
          {AUDIT_ENTITIES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar por nome, usuário ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Toolbar>

      {loading ? (
        <SkeletonRows count={6} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="historico"
          title="Nenhuma ação registrada"
          text="As ações de criar, editar e excluir aparecem aqui."
        />
      ) : (
        data.items.map((item) => {
          const action = AUDIT_ACTIONS[item.action] || { label: item.action, tone: "info" };
          return (
            <Row key={item._id} $tone={action.tone}>
              <div className="linha">
                <strong>{item.actorName || item.actorEmail || "Sistema"}</strong>
                <span className="acao">{action.label}</span>
                {item.label && <strong className="alvo">“{item.label}”</strong>}
              </div>
              <div className="detalhes">
                <span>{formatDate(item.createdAt)}</span>
                {item.actorEmail && <span>{item.actorEmail}</span>}
                {item.actorLevel && <span>{item.actorLevel}</span>}
                {item.ip && <span>IP {item.ip}</span>}
                {item.meta?.campos?.length > 0 && <span>Campos: {item.meta.campos.join(", ")}</span>}
                {item.meta?.nivel && <span>Nível: {item.meta.nivel}</span>}
              </div>
            </Row>
          );
        })
      )}

      {data.pages > 1 && (
        <Pager>
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </button>
          <span>
            Página {page + 1} de {data.pages}
          </span>
          <button type="button" disabled={page + 1 >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </button>
        </Pager>
      )}
    </AuditContainer>
  );
}
