import { defineConfig } from "vitest/config";

// Config separada do vite.config.js: testes não precisam do PWA nem do React plugin.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
    clearMocks: true,
  },
});
