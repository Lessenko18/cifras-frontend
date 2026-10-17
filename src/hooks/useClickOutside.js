import { useEffect, useRef } from "react";

// Chama `onOutside` quando o usuário clica fora do elemento de `ref`.
export function useClickOutside(ref, onOutside) {
  const handlerRef = useRef(onOutside);
  handlerRef.current = onOutside;

  useEffect(() => {
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) handlerRef.current();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref]);
}
