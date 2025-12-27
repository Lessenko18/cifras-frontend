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
      setEscolhidos((prev) => {
        if (prev.find((i) => i._id === item._id)) return prev;
        const novaLista = [...prev, item];
        props.addItem(novaLista);
        return novaLista;
      });
    }

    function removeSelect(item) {
      setEscolhidos((prev) => {
        const novaLista = prev.filter(
          (i) => i.id !== item.id || i._id !== item._id
        );
        props.addItem(novaLista);
        return novaLista;
      });
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

      setItems(Array.isArray(response.data) ? response.data : []);
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
          {escolhidos.map((item, index) => (
            <p key={item._id || `${item.nome}-${index}`}>
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
        {items.map((item, index) => (
          <p
            key={item._id || `${item.nome}-${index}`}
            onClick={() => handleSelect(item)}
          >
            {item.nome}
          </p>
        ))}
      </MultSeletorContainer>
    );
  }
