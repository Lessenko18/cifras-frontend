import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Sem escolha salva, segue o tema do sistema (prefers-color-scheme)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return (
    <ThemeContext.Provider value={{
        dark,
        // só grava no toggle manual: enquanto não escolher, acompanha o sistema
        toggle: () =>
          setDark((d) => {
            localStorage.setItem("theme", d ? "light" : "dark");
            return !d;
          }),
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
