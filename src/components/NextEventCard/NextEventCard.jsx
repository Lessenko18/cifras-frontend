import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiCalendar, FiPlay } from "react-icons/fi";
import { getRecentCifras } from "../../utils/recentCifras";

const Wrap = styled.section`
  margin-bottom: 16px;

  .evento {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    border-radius: 14px;
    background: var(--brand-gradient);
    color: #fff;
    box-shadow: 0 6px 18px var(--brand-shadow);
  }
  .rotulo {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.9;
  }
  h3 {
    margin: 4px 0 2px;
    font-size: 1.2rem;
  }
  .info {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.95;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: 10px;
    background: #fff;
    color: #3b2fb8;
    font-weight: 800;
    cursor: pointer;
  }
  .recentes {
    margin-top: 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .recentes a {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-primary);
    text-decoration: none;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DAY = 86400000;
const startOfToday = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

// "Próximo compromisso" (playlist com data a partir de hoje) + cifras recentes.
export default function NextEventCard({ playlists }) {
  const navigate = useNavigate();
  const recentes = useMemo(() => getRecentCifras(), []);

  const proxima = useMemo(() => {
    const hoje = startOfToday();
    return (playlists || [])
      .filter((p) => p.dataEvento && new Date(p.dataEvento).getTime() >= hoje - DAY / 2)
      .sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento))[0];
  }, [playlists]);

  if (!proxima && recentes.length === 0) return null;

  const data = proxima && new Date(proxima.dataEvento);
  const dias = proxima && Math.round((new Date(data).setUTCHours(12) - startOfToday()) / DAY);
  const quando =
    dias <= 0 ? "Hoje" : dias === 1 ? "Amanhã" : `Em ${dias} dias`;

  return (
    <Wrap aria-label="Próximo compromisso">
      {proxima && (
        <div className="evento">
          <div>
            <span className="rotulo">
              <FiCalendar aria-hidden="true" /> Próximo compromisso · {quando}
            </span>
            <h3>{proxima.nome}</h3>
            <p className="info">
              {data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" })} ·{" "}
              {proxima.cifras?.length || 0} música(s)
            </p>
          </div>
          <button type="button" onClick={() => navigate(`/home/playlists/${proxima._id}/ver?palco=1`)}>
            <FiPlay aria-hidden="true" /> Tocar agora
          </button>
        </div>
      )}
      {recentes.length > 0 && (
        <div className="recentes">
          <span>Recentes:</span>
          {recentes.map((c) => (
            <Link key={c.id} to={`/home/cifra/${c.id}`} title={c.artista ? `${c.nome} — ${c.artista}` : c.nome}>
              {c.nome}
            </Link>
          ))}
        </div>
      )}
    </Wrap>
  );
}
