/* Fotos dos artistas no ranking "Artistas mais acessados" da Home.
 * Pra adicionar uma foto: coloque o arquivo em /public e adicione uma
 * linha aqui com o nome do artista (case/acento não importam). Quem não
 * estiver no mapa continua mostrando o círculo com as iniciais. */
const ARTIST_IMAGES = {
  "colo de deus": "/colo_de_deus.jpg",
};

const normalize = (str) =>
  (str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export const getArtistImage = (artista) => ARTIST_IMAGES[normalize(artista)] || null;
