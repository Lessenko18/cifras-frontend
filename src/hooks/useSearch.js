import { useState, useEffect } from "react";

const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function useSearch(delay = 300, initial = "") {
  const [search, setSearch] = useState(initial);
  const [debounced, setDebounced] = useState(initial);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), delay);
    return () => clearTimeout(timer);
  }, [search, delay]);

  return { search, setSearch, debounced, normalize };
}
