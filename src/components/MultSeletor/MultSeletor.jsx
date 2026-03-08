import { useEffect, useState } from "react";
import { Input } from "../Input/Input";
import { GuardaEscolhidos, MultSeletorContainer } from "./MultSeletorStyled";
import { searchCategoria } from "../../service/categoriaService";
import { searchCifra } from "../../service/cifraService";

export default function MultSeletor({
  tipo,
  addItem,
  escolhidos = [],
  className,
  allowReorder = false,
}) {
  const [items, setItems] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  useEffect(() => {
    setItems([]);
  }, [tipo]);

  async function handleSearch(e) {
    const value = e.target.value.trim();

    if (!value) {
      setItems([]);
      return;
    }

    try {
      let response;

      if (tipo === "categoria") {
        response = await searchCategoria(value);
      } else if (tipo === "cifra") {
        response = await searchCifra(value);
      }

      setItems(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao buscar:", err);
      setItems([]);
    }
  }

  function handleSelect(item) {
    if (escolhidos.some((i) => (i._id || i.id) === (item._id || item.id)))
      return;

    addItem([...escolhidos, item]);
    setItems([]);
  }

  function removeSelect(item) {
    addItem(
      escolhidos.filter((i) => (i._id || i.id) !== (item._id || item.id)),
    );
  }

  function moveItem(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= escolhidos.length || toIndex >= escolhidos.length) return;

    const next = [...escolhidos];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    addItem(next);
  }

  function handleDragStart(index) {
    if (!allowReorder) return;
    setDragIndex(index);
    setDropIndex(index);
  }

  function handleDragOver(event, index) {
    if (!allowReorder) return;
    event.preventDefault();
    if (dropIndex !== index) setDropIndex(index);
  }

  function handleDrop(event, index) {
    if (!allowReorder) return;
    event.preventDefault();
    if (dragIndex === null) return;
    moveItem(dragIndex, index);
    setDragIndex(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDropIndex(null);
  }

  return (
    <MultSeletorContainer className={className}>
      {/* ESCOLHIDOS */}
      {escolhidos.length > 0 && (
        <GuardaEscolhidos>
          {escolhidos.map((item, index) => (
            <p
              key={`${item._id || item.id}-${item.nome}`}
              draggable={allowReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={handleDragEnd}
              className={`${allowReorder ? "reorderable" : ""} ${
                dragIndex === index ? "dragging" : ""
              } ${dropIndex === index ? "drag-over" : ""}`.trim()}
            >
              <span className="item-content">{item.nome}</span>
              <span className="item-actions">
                {allowReorder && (
                  <span className="drag-handle" title="Arraste para reordenar">
                    ::
                  </span>
                )}
                <span className="remove" onClick={() => removeSelect(item)}>
                  ×
                </span>
              </span>
            </p>
          ))}
        </GuardaEscolhidos>
      )}

      <h3>Adicionar {tipo}</h3>

      <Input
        type="text"
        placeholder={`Pesquisar ${tipo}`}
        onChange={handleSearch}
      />

      {items.map((item) => (
        <p
          key={`${item._id || item.id}-${item.nome}`}
          onClick={() => handleSelect(item)}
        >
          {item.nome}
        </p>
      ))}
    </MultSeletorContainer>
  );
}
