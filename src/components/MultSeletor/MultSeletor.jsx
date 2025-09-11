import { useEffect, useState } from "react";
import { Input } from "../Input/Input";
import { MultSeletorContainer } from "./MultSeletorStyled";
import { searchCategoria } from "../../service/categoriaService";

export default function MultSeletor(props) {
  const [tipo, setTipo] = useState("");
  const [items, setItems] = useState([]);
  const [escolhidos, setEscolhidos] = useState([]);

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
    console.log(response.data);
    setItems(response.data);
  }

  useEffect(() => {
    setTipo(props.tipo);
  }, []);

  return (
    <MultSeletorContainer>
      <h3>Adicionar categoria</h3>
      <Input
        type="text"
        placeholder="Pesquisar"
        onChange={(e) => handleSearch(e)}
      />
      {items.length > 0 &&
        items.map((item) => <p key={item._id}>{item.nome}</p>)}
      <button onClick={() => props.carainho(items)}>Aqui</button>
    </MultSeletorContainer>
  );
}
