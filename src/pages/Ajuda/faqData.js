/* Perguntas do FAQ da página de Ajuda — edite/adicione itens aqui.
 * `passos` vira uma lista numerada; `nota` é uma observação opcional. */
export const FAQ_ITEMS = [
  {
    pergunta: "Como criar uma playlist?",
    passos: [
      "Faça login para melhorar sua experiência (playlists são pessoais e exigem conta).",
      "Na Home ou em Playlists, clique em “+ Criar Nova Playlist”.",
      "Dê um nome, escolha uma capa (opcional) e marque as músicas que quer incluir.",
      "Salve. Depois, use “Ver Músicas” no card para abrir e tocar a playlist.",
    ],
    nota: "Pelos ícones do card você pode compartilhar a playlist por e-mail, editar ou excluir.",
  },
  {
    pergunta: "Como adicionar uma cifra?",
    passos: [
      "Faça login e vá em Cifras.",
      "Clique em “Adicionar Nova Cifra”.",
      "Preencha o título (obrigatório), artista, BPM e cole a cifra no campo “Cifra”.",
      "Clique em “Adicionar”.",
    ],
    nota: "Escreva os acordes em uma linha e a letra logo abaixo, o app alinha o acorde com a sílaba.",
  },
  {
    pergunta: "Como importar uma cifra de um PDF?",
    passos: [
      "Em Cifras, clique em “Importar PDF”.",
      "Selecione o arquivo e confira o que foi reconhecido.",
      "Ajuste o que for preciso e confirme a importação.",
    ],
  },
  {
    pergunta: "Como mudar o tom da cifra?",
    passos: [
      "Abra a cifra.",
      "Clique no botão “Tom”.",
      "Escolha a nota desejada: os acordes são transpostos na hora.",
    ],
  },
  {
    pergunta: "Como favoritar uma música?",
    passos: [
      "Faça login e clique no coração ao lado da música.",
      "Na Home, use o botão “Favoritos” para ver só as suas favoritas.",
    ],
  },
  {
    pergunta: "Onde fica o afinador?",
    passos: [
      "Abra Ferramentas no menu.",
      "Permita o uso do microfone quando o navegador pedir.",
      "Toque a corda e acompanhe o ponteiro até ficar no centro.",
    ],
  },
  {
    pergunta: "Quais são os atalhos e recursos de toque?",
    passos: [
      "Pressione “/” (ou Ctrl+K) em qualquer tela para ir à busca de músicas.",
      "Toque em um acorde da cifra para ver o diagrama (violão ou teclado/piano).",
      "No modal de tom, escolha entre sustenido ♯ e bemol ♭, simplifique a cifra e veja sugestões de capotraste.",
      "No modo palco: PgUp/PgDn rolam a página, Espaço pausa a rolagem, Esc sai; setas e deslizar trocam de música.",
      "Em uma playlist, “Salvar offline” guarda as cifras neste aparelho para usar sem internet.",
    ],
    nota: "Pedais Bluetooth que enviam PgUp/PgDn funcionam no modo palco.",
  },
];
