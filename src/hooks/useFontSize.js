import { useCallback } from "react";
import { createStoredNumber } from "../lib/storedPreference";

// Tamanho da letra da cifra (px), lembrado no aparelho. `change(delta)` respeita 12–30.
const cifraFontSize = createStoredNumber("cifra_fontSize", { initial: 18, min: 12, max: 30 });

export function useFontSize() {
  const fontSize = cifraFontSize.use();
  const change = useCallback((delta) => cifraFontSize.change(delta), []);
  return [fontSize, change];
}
