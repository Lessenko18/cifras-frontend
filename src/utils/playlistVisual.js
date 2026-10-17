/* Imagens de fundo temáticas para playlists sem capa própria */
const PLAYLIST_BG_IMAGES = {
  casamento: "/fundoCasamento.webp",
  adoracao: "/fundoAdoracao.webp",
  guitarra: "/fundoGuitarra.webp",
};

const PLAYLIST_BG_KEYWORDS = [
  { re: /casament|noiv/i, key: "casamento" },
  { re: /ador|retiro|ora[cç][aã]o|missa|liturg/i, key: "adoracao" },
];

export const getPlaylistBgImage = (nome) => {
  const name = nome || "";
  const keyword = PLAYLIST_BG_KEYWORDS.find(({ re }) => re.test(name));
  return PLAYLIST_BG_IMAGES[keyword ? keyword.key : "guitarra"];
};
