import { useState, useEffect } from "react";

const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function useSearch(delay = 300) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), delay);
    return () => clearTimeout(timer);
  }, [search, delay]);

  return { search, setSearch, debounced, normalize };
}
