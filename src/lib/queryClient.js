import { QueryClient } from "@tanstack/react-query";

// Cliente único do cache de dados. É um módulo (e não criado no React) para o
// login/logout poderem limpá-lo: sem isso, a playlist de uma conta apareceria
// por instantes para a próxima conta que entrasse no mesmo navegador.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
