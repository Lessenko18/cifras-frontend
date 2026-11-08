import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Origem da API vinda do MESMO env que o app usa (VITE_API_BASE_URL), para o
// service worker nunca apontar para um host diferente do real (antes estava
// fixo em onrender.com enquanto a API roda na Vercel, então o cache nunca valia).
function apiOrigin(mode) {
  const env = loadEnv(mode, ".", "VITE_");
  try {
    return new URL(env.VITE_API_BASE_URL?.trim() || "http://localhost:3000").origin;
  } catch {
    return "";
  }
}

export default defineConfig(({ mode }) => {
  const API = apiOrigin(mode);
  const origin = API.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  // Só o catálogo público pode ir para cache. Playlists privadas, favoritos,
  // auditoria, feedback e tudo de /auth e /user são por usuário e nunca ficam em
  // cache (senão outra conta no mesmo aparelho veria dados da anterior).
  // IMPORTANTE: o workbox serializa o config para dentro do sw.js, então aqui só
  // valem RegExp (com a origem já embutida); funções não enxergam variáveis daqui.
  const PUBLIC = "(cifra|categoria|playlist/public)(/|\\?|$)";
  const publicApi = API ? new RegExp("^" + origin + "/" + PUBLIC) : /(?!)/;
  const privateApi = API ? new RegExp("^" + origin + "/(?!" + PUBLIC + ")") : /(?!)/;

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logotlcifras.webp", "tlcifras.webp"],
      manifest: {
        name: "TL Cifras",
        short_name: "TL Cifras",
        description: "O melhor acervo de cifras e playlists para músicos.",
        theme_color: "#1a1a2e",
        background_color: "#1a1a2e",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        runtimeCaching: [
          {
            // Auth e dados do usuário logado nunca podem vir de cache: um
            // avatar novo (ou logout/login com outra conta) precisa sempre
            // bater no servidor, senão a página fica com dados de sessões
            // anteriores.
            urlPattern: privateApi,
            handler: "NetworkOnly",
          },
          {
            urlPattern: publicApi,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  base: "/",
  };
});
