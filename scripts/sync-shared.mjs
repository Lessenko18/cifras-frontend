// O parser de cifras / ChordPro existe nos dois projetos e PRECISA se comportar igual
// (o backend converte e prova a conversão; o front renderiza). O DONO do código é o
// frontend: o backend recebe cópias geradas por este script.
//
//   npm run sync:shared          copia para ../Backend/src/utils
//   npm run sync:shared -- --check   só verifica (sai com erro se divergir)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendUtils = path.resolve(root, "../Backend/src/utils");

export const SHARED_FILES = ["chordpro.js", "cifraParser.js", "cleanCifraText.js"];

const BANNER = (name) =>
  `// GERADO por Frontend/scripts/sync-shared.mjs a partir de Frontend/src/utils/${name}.\n` +
  `// NÃO edite aqui: edite no Frontend e rode "npm run sync:shared".\n`;

const normalize = (text) => text.replace(/\r\n/g, "\n");

// No backend (ESM puro) os imports relativos precisam da extensão .js.
export function buildBackendCopy(name, frontendSource) {
  const body = normalize(frontendSource).replace(
    /(from\s+["']\.\/[^"'.]+)(["'])/g,
    "$1.js$2",
  );
  return BANNER(name) + body;
}

export function checkShared() {
  if (!fs.existsSync(backendUtils)) return { skipped: true, diverged: [] };
  const diverged = SHARED_FILES.filter((name) => {
    const expected = buildBackendCopy(name, fs.readFileSync(path.join(root, "src/utils", name), "utf8"));
    const target = path.join(backendUtils, name);
    return !fs.existsSync(target) || normalize(fs.readFileSync(target, "utf8")) !== expected;
  });
  return { skipped: false, diverged };
}

function main() {
  if (process.argv.includes("--check")) {
    const { skipped, diverged } = checkShared();
    if (skipped) return console.log("Backend não encontrado ao lado: nada a verificar.");
    if (diverged.length) {
      console.error(`Divergiram do frontend: ${diverged.join(", ")}. Rode "npm run sync:shared".`);
      process.exit(1);
    }
    return console.log("Parser compartilhado em sincronia.");
  }

  for (const name of SHARED_FILES) {
    const source = fs.readFileSync(path.join(root, "src/utils", name), "utf8");
    fs.writeFileSync(path.join(backendUtils, name), buildBackendCopy(name, source));
    console.log(`copiado: ${name}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
