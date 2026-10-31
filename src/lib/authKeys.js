// Chave do usuário logado no cache do React Query. Fonte ÚNICA do usuário no app:
// o AuthContext lê daqui, o login grava aqui e o perfil atualiza aqui.
export const meKey = ["auth", "me"];
