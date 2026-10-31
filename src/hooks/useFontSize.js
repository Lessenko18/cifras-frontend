import { useCallback, useState } from "react";
import { storage } from "../lib/storage";

// Tamanho da letra da cifra (px), lembrado no aparelho. `change(delta)` respeita 12–30.
export function useFontSize(initial = 18, min = 12, max = 30) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = parseInt(storage.get("cifra_fontSize"), 10);
    return Number.isNaN(saved) ? initial : saved;
  });

  const change = useCallback(
    (delta) => {
      setFontSize((prev) => {
        const next = Math.min(max, Math.max(min, prev + delta));
        storage.set("cifra_fontSize", next);
        return next;
      });
    },
    [min, max],
  );

  return [fontSize, change];
}
