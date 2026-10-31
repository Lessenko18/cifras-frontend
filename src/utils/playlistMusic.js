import { detectKey, renderCifra } from "./cifraDoc";
import { getKeyAtOffset } from "./transpose";

// A música de uma playlist pode vir com o id em campos diferentes (visão da API,
// cópia offline, link público).
export function getMusicId(item) {
  if (!item) return null;
  return item._id || item.id || item.cifraId || item.musicaId || null;
}

// Tom original, tom atual e cifra já transposta de uma música da playlist.
export function describeMusic(music, semitones = 0) {
  const source = { text: music.descricao, chordpro: music.chordpro };
  const originalKey = detectKey(source);
  return {
    originalKey,
    currentKey: getKeyAtOffset(originalKey, semitones),
    doc: renderCifra(source, semitones),
  };
}

// Dados de uma música no formato que o exportador de PDF espera.
export function toPdfSong(music, semitones = 0) {
  const { originalKey, currentKey, doc } = describeMusic(music, semitones);
  return {
    nome: music.nome,
    tom: originalKey ? currentKey : null,
    bpm: music.bpm,
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
