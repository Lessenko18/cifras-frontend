// Os arquivos .env.* do front são versionados e vão para o navegador: só podem ter
// variáveis VITE_* públicas. Falha (e barra o CI) se aparecer outra chave ou algo que
// pareça segredo. Segredos ficam no painel do host (Vercel) ou em .env.local (ignorado).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SECRET_HINT = /(secret|password|passwd|private|token|api[_-]?key)/i;
const problems = [];

for (const file of fs.readdirSync(root).filter((f) => /^\.env(\..+)?$/.test(f) && !f.endsWith(".local"))) {
  fs.readFileSync(path.join(root, file), "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (!m) return; // comentário ou linha vazia
      if (!m[1].startsWith("VITE_")) problems.push(`${file}:${i + 1} ${m[1]} não começa com VITE_`);
      else if (SECRET_HINT.test(m[1]) && !/DSN/i.test(m[1])) problems.push(`${file}:${i + 1} ${m[1]} parece um segredo`);
    });
}

if (problems.length) {
  console.error("Segredo (ou variável não pública) em arquivo .env versionado:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("check-env: ok");
