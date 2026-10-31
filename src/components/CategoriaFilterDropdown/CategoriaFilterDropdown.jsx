import { useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

const byNome = (a, b) => a.nome.localeCompare(b.nome);
const parentIdOf = (c) => String(c.parent?._id || c.parent);

const arrowStyle = (open, extra) => ({
  fontSize: "0.7em",
  color: "#7c3aed",
  display: "inline-block",
  transition: "transform 0.2s",
  transform: open ? "rotate(0deg)" : "rotate(-90deg)",
  ...extra,
});

// Filtro de categoria em árvore (pai → subcategorias). Cada tela passa os seus
// styled-components em `styles` ({ Wrapper, Trigger, Panel, Item }) para manter o visual.
export default function CategoriaFilterDropdown({
  categorias,
  value,
  onChange,
  label,
  styles,
  togglePadding = "0 12px",
}) {
  const { Wrapper, Trigger, Panel, Item } = styles;
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const roots = useMemo(() => categorias.filter((c) => !c.parent).sort(byNome), [categorias]);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
  };

  const toggleExpanded = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Wrapper ref={ref}>
      <Trigger type="button" onClick={() => setOpen((o) => !o)} aria-label="Filtrar por categoria">
        <span>{label}</span>
        <span style={arrowStyle(open)}>▼</span>
      </Trigger>

      {open && (
        <Panel>
          <Item $active={value === ""} onClick={() => choose("")}>
            Todas as categorias
          </Item>

          {roots.map((root) => {
            const children = categorias.filter((c) => parentIdOf(c) === String(root._id)).sort(byNome);

            if (children.length === 0) {
              return (
                <Item key={root._id} $active={value === root._id} onClick={() => choose(root._id)}>
                  {root.nome}
                </Item>
              );
            }

            const isExpanded = expanded.has(root._id);
            return (
              <div key={root._id}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Item $active={value === root._id} style={{ flex: 1 }} onClick={() => choose(root._id)}>
                    {root.nome}
                  </Item>
                  <button
                    type="button"
                    aria-label={isExpanded ? `Recolher ${root.nome}` : `Expandir ${root.nome}`}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(root._id)}
                    style={arrowStyle(isExpanded, {
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: togglePadding,
                    })}
                  >
                    ▼
                  </button>
                </div>
                {isExpanded &&
                  children.map((child) => (
                    <Item key={child._id} $active={value === child._id} $indent onClick={() => choose(child._id)}>
                      ↳ {child.nome}
                    </Item>
                  ))}
              </div>
            );
          })}
        </Panel>
      )}
    </Wrapper>
  );
}
