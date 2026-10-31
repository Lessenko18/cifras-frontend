import { Sumario } from "../VerPlaylistStyled";
import { getMusicId } from "../../../utils/playlistMusic";

export default function SumarioMusicas({ musicas, ativo, onSelect }) {
  return (
    <Sumario>
      <div style={{ fontWeight: "bold", padding: "10px", color: "#666" }}>Músicas</div>
      {musicas.map((m, i) => (
        <button key={`${getMusicId(m)}-${i}`} onClick={() => onSelect(i)} className={i === ativo ? "ativo" : ""}>
          {m.nome}
        </button>
      ))}
    </Sumario>
  );
}
