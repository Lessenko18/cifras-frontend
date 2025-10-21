import { useEffect, useState } from "react";
import { Input } from "../Input/Input";
import { GuardaEscolhidos, MultSeletorContainer } from "./MultSeletorStyled";
import { searchCategoria } from "../../service/categoriaService";
import { searchCifra } from "../../service/cifraService";

export default function MultSeletor(props) {
  const [tipo, setTipo] = useState("");
  const [items, setItems] = useState([]);
  const [escolhidos, setEscolhidos] = useState([]);

  function handleSelect(item) {
    let lista = [...escolhidos];
    if (lista.find((i) => i._id === item._id)) return;
    lista.push(item);
    setEscolhidos(lista);
    props.addItem(lista);
  }

  function removeSelect(item) {
    let lista = escolhidos.filter((i) => i._id !== item._id);
    setEscolhidos(lista);
    props.addItem(lista); 
  }

  async function handleSearch(e) {
    const value = e.target.value.trim();
    if (value === "") {
      setItems([]);
      return;
    }

    let response = {};
    if (tipo === "categoria") {
      response = await searchCategoria(value);
    } else if (tipo === "cifra") {
      response = await searchCifra(value);
    }

    setItems(response.data || []);
  }
  useEffect(() => {
    setTipo(props.tipo);
  }, [props.tipo]);

  useEffect(() => {
    if (props.escolhidos && props.escolhidos.length > 0) {
      setEscolhidos(props.escolhidos);
    } else {
      setEscolhidos([]);
    }
  }, [props.escolhidos]);

  return (
    <MultSeletorContainer>
      <GuardaEscolhidos>
        {escolhidos.map((item) => (
          <p key={item._id}>
            {item.nome}
            <span className="remove" onClick={() => removeSelect(item)}>
              X
            </span>
          </p>
        ))}
      </GuardaEscolhidos>

      <h3>Adicionar {tipo}</h3>
      <Input
        type="text"
        placeholder={`Pesquisar a ${tipo}`}
        onChange={handleSearch}
      />

      {items.map((item) => (
        <p key={item._id} onClick={() => handleSelect(item)}>
          {item.nome}
        </p>
      ))}
    </MultSeletorContainer>
  );
}
