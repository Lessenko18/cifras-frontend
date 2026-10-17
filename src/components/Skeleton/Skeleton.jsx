import { Bar, CardsGrid, CardBox, RowBox } from "./SkeletonStyled";

/** Barra cinza com brilho. Use `width`/`height` para dar o formato. */
function Skeleton({ width = "100%", height = 14, radius = 8, style }) {
  return <Bar aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />;
}

/** Grade de cards (ex.: playlists) enquanto carrega. */
export function SkeletonCards({ count = 6, height = 170, columns = 2 }) {
  return (
    <CardsGrid role="status" aria-label="Carregando" $columns={columns}>
      {Array.from({ length: count }, (_, i) => (
        <CardBox key={i} style={{ height }}>
          <Skeleton width="55%" height={16} />
          <Skeleton width="30%" height={12} />
          <Skeleton width={110} height={34} radius={10} style={{ marginTop: 8 }} />
        </CardBox>
      ))}
    </CardsGrid>
  );
}

/** Linhas de lista (ex.: cifras) enquanto carrega. */
export function SkeletonRows({ count = 6 }) {
  return (
    <div role="status" aria-label="Carregando" style={{ display: "grid", gap: 10, width: "100%" }}>
      {Array.from({ length: count }, (_, i) => (
        <RowBox key={i}>
          <Skeleton width={`${50 + ((i * 13) % 30)}%`} height={15} />
          <Skeleton width="28%" height={11} />
        </RowBox>
      ))}
    </div>
  );
}

/** Bloco de página inteira (troca o texto "Carregando..."). */
export function SkeletonPage() {
  return (
    <div style={{ width: "100%", maxWidth: 900, padding: "24px 16px", display: "grid", gap: 16 }}>
      <Skeleton width="38%" height={26} />
      <SkeletonRows count={5} />
    </div>
  );
}
