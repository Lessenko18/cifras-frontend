// Anterior / "Página X de Y" / Próxima. Cada tela passa seus styled-components em
// `styles` ({ Container, Button, Info }) para manter o visual. Some quando há 1 página.
export default function Paginacao({ page, pages, onChange, styles }) {
  const { Container, Button, Info } = styles;
  if (pages <= 1) return null;

  return (
    <Container>
      <Button disabled={page === 0} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <Info>
        Página {page + 1} de {pages}
      </Info>
      <Button disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}>
        Próxima
      </Button>
    </Container>
  );
}
