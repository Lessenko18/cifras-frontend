import { getSimplify, setSimplify, suggestCapo, useSimplify } from "../../utils/transpose";

// Extras do modal de tom: cifra simplificada (N3) e sugestão de capotraste (N2).
// Reusa as classes .tom-semitom / .tom-titulo do ModalTom.
export default function TomExtras({ currentKey }) {
  const simple = useSimplify();
  const capos = suggestCapo(currentKey);

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
      {capos.length > 0 && (
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-primary)" }}>Capotraste:</strong>{" "}
          {capos
            .map((o) => (o.capo === 0 ? `forma de ${o.shape} (sem capo)` : `forma de ${o.shape} com capo na ${o.capo}ª casa`))
            .join(" · ")}
        </p>
      )}
    </>
  );
}
