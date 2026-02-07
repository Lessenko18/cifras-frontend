import { useEffect, useState } from "react";
import { Input } from "../Input/Input";
import { GuardaEscolhidos, MultSeletorContainer } from "./MultSeletorStyled";
import { searchCategoria } from "../../service/categoriaService";
import { searchCifra } from "../../service/cifraService";

export default function MultSeletor({ tipo, addItem, escolhidos = [] }) {
  const [items, setItems] = useState([]);

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
      escolhidos.filter((i) => (i._id || i.id) !== (item._id || item.id))
    );
  }

  return (
    <MultSeletorContainer>
      {/* ESCOLHIDOS */}
      {escolhidos.length > 0 && (
        <GuardaEscolhidos>
          {escolhidos.map((item) => (
            <p key={`${item._id || item.id}-${item.nome}`}>
              {item.nome}
              <span className="remove" onClick={() => removeSelect(item)}>
                ×
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
