import { detectKey, detectMinor, renderCifra } from "./cifraDoc";
import { getKeyAtOffset } from "./transpose";
import { shapeSemitones } from "./capoStorage";

// A música de uma playlist pode vir com o id em campos diferentes (visão da API,
// cópia offline, link público).
export function getMusicId(item) {
  if (!item) return null;
  return item._id || item.id || item.cifraId || item.musicaId || null;
}

// Tom original, tom atual e cifra já transposta de uma música da playlist.
// `prefs` ({ accidental, simplify, capo }) é opcional: sem ele vale o salvo no aparelho.
// `capo` (casa): o tom (`currentKey`) continua sendo o que soa e a cifra (`doc`) mostra as
// formas de acorde para tocar com o capo.
export function describeMusic(music, semitones = 0, prefs = {}) {
  const { capo = 0, ...renderPrefs } = prefs;
  const source = { text: music.descricao, chordpro: music.chordpro };
  const originalKey = detectKey(source);
  return {
    originalKey,
    currentKey: getKeyAtOffset(originalKey, semitones, prefs.accidental),
    minor: detectMinor(source),
    capo,
    doc: renderCifra(source, shapeSemitones(semitones, capo), renderPrefs),
  };
}

// Dados de uma música no formato que o exportador de PDF espera.
export function toPdfSong(music, semitones = 0, prefs = {}) {
  const { originalKey, currentKey, minor, capo, doc } = describeMusic(music, semitones, prefs);
  return {
    nome: music.nome,
    tom: originalKey ? currentKey + (minor ? "m" : "") : null,
    bpm: music.bpm,
    capo,
    text: doc.text,
  };
}

// Tom de cada música ao abrir a playlist: o do servidor tem prioridade; o salvo
// neste aparelho só cobre playlists antigas que ainda não têm tom gravado.
export function resolveInitialToms(musicas, remoteToms, getLocalTom) {
  const toms = {};
  (musicas || []).forEach((m) => {
    const songId = getMusicId(m);
    const remote = remoteToms?.[String(songId)];
    if (typeof remote === "number") {
      toms[songId] = remote;
      return;
    }
    const local = getLocalTom(songId);
    if (local !== null) toms[songId] = local;
  });
  return toms;
}
