import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mini renderHook (sem @testing-library): monta um componente que chama o hook e
// guarda o último retorno em `result.current`.
export function renderHook(hook, props) {
  const result = { current: undefined };
  const container = document.createElement("div");
  const root = createRoot(container);

  function Probe({ hookProps }) {
    result.current = hook(hookProps);
    return null;
  }

  const render = (nextProps) => act(() => root.render(createElement(Probe, { hookProps: nextProps })));
  render(props);

  return {
    result,
    rerender: render,
    unmount: () => act(() => root.unmount()),
  };
}

export { act };
