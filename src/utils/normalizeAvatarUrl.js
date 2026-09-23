// O backend agora sempre retorna uma URL do avatar já assinada e pronta pra
// uso (bucket R2 é privado). Não mexemos mais na URL aqui — remover a query
// string quebraria o acesso, já que sem assinatura o R2 recusa a requisição.
export function normalizeAvatarUrl(url) {
  return url;
}
