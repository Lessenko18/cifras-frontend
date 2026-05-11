import styled from "styled-components";
import { parseCifraText } from "../../utils/cifraParser";

const Container = styled.div`
  font-family: monospace;
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
  color: var(--main);
  font-weight: 700;
  font-size: 0.85em;
  line-height: 1.5;
  min-height: 1.5em;
`;

const LyricSpan = styled.span`
  display: block;
  line-height: 1.5;
`;

const PlainLine = styled.div`
  white-space: pre;
  line-height: 1.5;
`;

const ChordOnlyLine = styled.div`
  white-space: pre;
  color: var(--main);
  font-weight: 700;
  line-height: 1.5;
`;

const Blank = styled.div`
  height: 0.75em;
`;

export function CifraRenderer({ text, style }) {
  const segments = parseCifraText(text);

  return (
    <Container style={style}>
      {segments.map((seg, i) => {
        if (seg.type === "blank") return <Blank key={i} />;

        if (seg.type === "plain") return <PlainLine key={i}>{seg.line}</PlainLine>;

        if (seg.type === "chord-only")
          return <ChordOnlyLine key={i}>{seg.line}</ChordOnlyLine>;

        // chord-lyric
        return (
          <ChordLyricLine key={i}>
            {seg.tokens.map((token, j) => (
              <Token key={j}>
                <ChordSpan>{token.chord || " "}</ChordSpan>
                <LyricSpan>{token.lyric || " "}</LyricSpan>
              </Token>
            ))}
          </ChordLyricLine>
        );
      })}
    </Container>
  );
}
