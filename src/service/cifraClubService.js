function capitalizeSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function fetchCifraClub(url) {
  try {
    const parts = new URL(url).pathname.replace(/^\/|\/$/g, '').split('/');
    const artista = parts[0] ? capitalizeSlug(parts[0]) : '';
    const nome = parts[1] ? capitalizeSlug(parts[1]) : '';

    if (!artista && !nome) throw new Error('URL inválida');

    return Promise.resolve({ artista, nome });
  } catch {
    return Promise.reject(new Error('URL inválida. Use um link do CifraClub.'));
  }
}
