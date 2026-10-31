import { useEffect, useState } from "react";

// Índice da música que está na metade de cima da tela (destaca o sumário e define
// em qual música o modo palco abre). Os cartões precisam ter id="musica-<índice>".
export function useActiveMusic(count) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!count) return undefined;
    const handler = () => {
      let ativo = 0;
      for (let i = 0; i < count; i += 1) {
        const el = document.getElementById(`musica-${i}`);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 2) ativo = i;
      }
      setActive(ativo);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [count]);

  return active;
}
