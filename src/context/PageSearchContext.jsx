import { createContext, useContext, useState, useEffect, useCallback } from "react";

const PageSearchContext = createContext(null);

export function PageSearchProvider({ children }) {
  const [config, setConfig] = useState(null);

  return (
    <PageSearchContext.Provider value={{ config, setConfig }}>
      {children}
    </PageSearchContext.Provider>
  );
}

export function usePageSearchConfig() {
  const ctx = useContext(PageSearchContext);
  return ctx?.config || null;
}

// Usado pela página (Cifras, Playlists) para registrar sua busca na Navbar
export function usePageSearchBox({ placeholder, value, onChange }) {
  const ctx = useContext(PageSearchContext);
  const { setConfig } = ctx || {};

  const stableOnChange = useCallback((val) => onChange(val), [onChange]);

  useEffect(() => {
    if (!setConfig) return;
    setConfig({ placeholder, value, onChange: stableOnChange });
    return () => setConfig(null);
  }, [setConfig, placeholder, value, stableOnChange]);
}
