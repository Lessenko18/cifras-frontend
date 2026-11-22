import { memo } from "react";
import { splitHighlight } from "../../utils/highlight";

// Mostra `texto` com o trecho que bate com `termo` (a busca) em destaque.
const Destaque = memo(function Destaque({ texto, termo }) {
  const parts = splitHighlight(texto, termo);
  if (parts.length === 1 && !parts[0].match) return parts[0].text;
  return parts.map((part, i) =>
    part.match ? (
      <mark
        key={i}
        style={{ background: "color-mix(in srgb, var(--chord, #f5a524) 30%, transparent)", color: "inherit", borderRadius: 3, padding: "0 1px" }}
      >
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
});

export default Destaque;
