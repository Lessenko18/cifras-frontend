import { getSimplify, setSimplify, suggestCapo, useSimplify } from "../../utils/transpose";
import { MAX_CAPO, saveCapo } from "../../utils/capoStorage";

const muted = { margin: "0 0 14px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 };

// Extras do modal de tom: cifra simplificada (N3) e capotraste (N2).
// Reusa as classes .tom-semitom / .tom-titulo do ModalTom.
//   currentKey  tom que SOA (só a nota, ex.: "Eb"); minor diz se é menor
//   cifraId     de quem é o capo escolhido (guardado neste aparelho)
//   capo        casa atual (0 = sem capo); formaLabel = tom das formas com esse capo (ex.: "Dm")
export default function TomExtras({ currentKey, minor = false, cifraId, capo = 0, formaLabel }) {
  const simple = useSimplify();
  const capos = suggestCapo(currentKey, minor);
  const canCapo = Boolean(cifraId);

  return (
    <>
      <div className="tom-semitom">
        <button
          type="button"
          className={simple ? "ativo" : ""}
          aria-pressed={simple}
          title="Reduz C7M, Am7, F/G… para C, Am, F (bom para iniciantes e crianças)"
          onClick={() => setSimplify(!getSimplify())}
        >
          Cifra simplificada
        </button>
      </div>

      {canCapo && (
        <div style={{ margin: "0 0 14px" }}>
          <label htmlFor="capo-casa" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            Capotraste
          </label>
          <select
            id="capo-casa"
            value={capo}
            onChange={(e) => saveCapo(cifraId, Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              font: "inherit",
            }}
          >
            <option value={0}>Sem capotraste</option>
            {Array.from({ length: MAX_CAPO }, (_, i) => i + 1).map((casa) => (
              <option key={casa} value={casa}>
                {casa}ª casa
              </option>
            ))}
          </select>
          {capo > 0 && formaLabel && (
            <p style={{ ...muted, margin: "8px 0 0" }}>
              Com capo na {capo}ª casa, toque as formas de <strong style={{ color: "var(--text-primary)" }}>{formaLabel}</strong>{" "}
              (o som continua em {currentKey}
              {minor ? "m" : ""}).
            </p>
          )}
        </div>
      )}

      {capos.length > 0 && (
        <div style={{ margin: "0 0 14px" }}>
          <p style={{ ...muted, margin: "0 0 6px" }}>
            <strong style={{ color: "var(--text-primary)" }}>Formas fáceis:</strong>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {capos.map((o) => {
              const ativo = canCapo && o.capo === capo;
              const texto = o.capo === 0 ? `${o.label} (sem capo)` : `${o.label} · capo ${o.capo}ª`;
              return canCapo ? (
                <button
                  key={o.shape}
                  type="button"
                  className={ativo ? "ativo" : ""}
                  aria-pressed={ativo}
                  onClick={() => saveCapo(cifraId, o.capo)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    background: ativo ? "var(--main)" : "transparent",
                    color: ativo ? "#fff" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {texto}
                </button>
              ) : (
                <span key={o.shape} style={muted}>
                  {texto}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
