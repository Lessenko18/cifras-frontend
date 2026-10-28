import { lazy, Suspense, useState } from "react";
import styled from "styled-components";
import { parseCifraText } from "../../utils/cifraParser";

const ChordDialog = lazy(() => import("../ChordDialog/ChordDialog"));

const Container = styled.div`
  font-family: "JetBrains Mono", ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: clamp(14px, 1.1vw + 11px, 19px);
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 14px;
  text-align: left;
  overflow-x: auto;

  @media (max-width: 675px) {
    padding: 8px 8px;
  }
  @media (max-width: 430px) {
    padding: 6px 6px;
  }
`;

// Linha com acorde + letra: tokens em flex que quebram entre si, nunca internamente
const ChordLyricLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 2px;
`;

// Célula: acorde em cima, letra em baixo — nunca se separam
const Token = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  white-space: pre;
`;

const ChordSpan = styled.span`
  display: block;
  color: var(--chord);
  font-weight: 700;
  font-size: 0.85em;
  line-height: 1.55;
  min-height: 1.5em;

  .acorde {
    cursor: pointer;
    border-radius: 4px;
  }
  .acorde:hover {
    text-decoration: underline;
  }
`;

const LyricSpan = styled.span`
  display: block;
  line-height: 1.55;
`;

const PlainLine = styled.div`
  white-space: pre;
  line-height: 1.55;
`;

const ChordOnlyLine = styled.div`
  white-space: pre;
  color: var(--chord);
  font-weight: 700;
  line-height: 1.55;
`;

// Rótulo de seção: "[Refrão]" vira um marcador visual (refrão com fundo tingido)
const SECTION_RE = /^\s*\[([^\]]{1,40})\]\s*$/;

const SectionLabel = styled.div`
  font-family: Inter, "Roboto", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--section);
  border-left: 3px solid var(--section);
  padding: 2px 0 2px 8px;
  margin: 22px 0 8px;
  white-space: normal;
  break-after: avoid;
  ${({ $chorus }) =>
    $chorus
      ? "background: color-mix(in srgb, var(--section) 8%, transparent);"
      : ""}
`;

const Blank = styled.div`
  height: 0.75em;
`;

// interactiveChords: toque no acorde abre o diagrama (desligado no modo palco)
// `segments`: trechos já prontos (vindos do ChordPro); sem eles, interpreta `text` (cifras antigas)
export function CifraRenderer({ text, segments: ready, style, interactiveChords = true }) {
  const segments = ready ?? parseCifraText(text);
  // Toque/clique num acorde abre o diagrama (N1)
  const [chordOpen, setChordOpen] = useState(null);

  return (
    <Container style={style}>
      {chordOpen && (
        <Suspense fallback={null}>
          <ChordDialog chord={chordOpen} onClose={() => setChordOpen(null)} />
        </Suspense>
      )}
      {segments.map((seg, i) => {
        if (seg.type === "blank") return <Blank key={i} />;

        if (seg.type === "plain") {
          const section = seg.line.match(SECTION_RE);
          if (section) {
            return (
              <SectionLabel key={i} $chorus={/refr[aã]o/i.test(section[1])}>
                {section[1]}
              </SectionLabel>
            );
          }
          return <PlainLine key={i}>{seg.line}</PlainLine>;
        }

        if (seg.type === "chord-only")
          return <ChordOnlyLine key={i}>{seg.line}</ChordOnlyLine>;

        // chord-lyric
        return (
          <ChordLyricLine key={i}>
            {seg.tokens.map((token, j) => (
              <Token key={j}>
                {token.chord && interactiveChords ? (
                  // o parser junta acordes da mesma palavra ("F# B"): cada um abre o seu diagrama
                  <ChordSpan>
                    {token.chord.split(" ").map((c, k) => (
                      <span key={k}>
                        {k > 0 && " "}
                        <span
                          role="button"
                          tabIndex={0}
                          className="acorde"
                          aria-label={`Ver diagrama do acorde ${c}`}
                          onClick={() => setChordOpen(c)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setChordOpen(c);
                            }
                          }}
                        >
                          {c}
                        </span>
                      </span>
                    ))}
                  </ChordSpan>
                ) : (
                  <ChordSpan>{token.chord || " "}</ChordSpan>
                )}
                <LyricSpan>{token.lyric || " "}</LyricSpan>
              </Token>
            ))}
          </ChordLyricLine>
        );
      })}
    </Container>
  );
}
