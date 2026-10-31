// Extrai artista e título de um link do CifraClub (ex.: cifraclub.com.br/artista/musica/).
// Não faz requisição nenhuma: só interpreta o caminho da URL. Lança se não for um link válido.
function capitalizeSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function parseCifraClubUrl(url) {
  try {
    const parts = new URL(url).pathname.replace(/^\/|\/$/g, '').split('/');
    const artista = parts[0] ? capitalizeSlug(parts[0]) : '';
    const nome = parts[1] ? capitalizeSlug(parts[1]) : '';

    if (!artista && !nome) throw new Error('URL inválida');

    return { artista, nome };
  } catch {
    throw new Error('URL inválida. Use um link do CifraClub.');
  }
}
