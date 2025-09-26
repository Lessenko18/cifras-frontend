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
    if (lista.find((i) => i._id == item._id)) {
      return;
    }
    lista.push(item);
    setEscolhidos(lista);
    props.addItem(lista);
  }
  function removeSelect(item) {
    let lista = [...escolhidos];
    lista = lista.filter((i) => i._id != item._id);
    setEscolhidos(lista);
  }
  async function handleSearch(e) {
    var response = {};
    if (e.target.value.trim() == "") {
      setItems([]);
      return;
    }
    if (tipo == "categoria") {
      console.log(e);
      response = await searchCategoria(e.target.value);
    }
    if (tipo == "cifra") {
      console.log(e);
      response = await searchCifra(e.target.value);
    }
    // console.log(response.data);
    setItems(response.data);
  }

  useEffect(() => {
    setTipo(props.tipo);
  }, []);

  return (
    <MultSeletorContainer>
      <GuardaEscolhidos>
        {escolhidos.length > 0 &&
          escolhidos.map((item) => (
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
        onChange={(e) => handleSearch(e)}
      />
      {items.length > 0 &&
        items.map((item) => (
          <p key={item._id} onClick={() => handleSelect(item)}>
            {item.nome}
          </p>
        ))}
    </MultSeletorContainer>
  );
}
