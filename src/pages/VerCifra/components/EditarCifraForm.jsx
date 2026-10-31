import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { FiTrash2 } from "react-icons/fi";
import { Input } from "../../../components/Input/Input";
import { GuardaEscolhidos, MultSeletorContainer } from "../../../components/MultSeletor/MultSeletorStyled";
import { searchCategoria } from "../../../service/categoriaService";
import { UpdateCifra } from "../VerCifraStyled";

// Formulário de edição da cifra (campos não controlados, lidos no submit) com a
// busca de categorias. `escolhidos` é controlado pela página porque entra no PATCH.
export default function EditarCifraForm({ cifra, escolhidos, onChangeEscolhidos, onSubmit, onRequestDelete }) {
  const [categoriaQuery, setCategoriaQuery] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const query = categoriaQuery.trim();

    if (!query) {
      setCategorias([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await searchCategoria(query);
        setCategorias(response.data || []);
      } catch (err) {
        console.error(err);
        setCategorias([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [categoriaQuery]);

  function handleSelect(item) {
    if (escolhidos.some((i) => i._id === item._id)) return;
    onChangeEscolhidos([...escolhidos, item]);
  }

  function removeSelect(item) {
    onChangeEscolhidos(escolhidos.filter((i) => i._id !== item._id));
  }

  return (
    <UpdateCifra onSubmit={onSubmit}>
      <div>
        <label htmlFor="nome">Nome da Música</label>
        <Input type="text" name="nome" defaultValue={cifra.nome} />
      </div>
      <div>
        <label htmlFor="artista">Artista</label>
        <Input type="text" name="artista" defaultValue={cifra.artista || ""} placeholder="Nome do artista (opcional)" />
      </div>
      <div>
        <label htmlFor="link">Link da cifra</label>
        <Input type="text" name="link" defaultValue={cifra.link} />
      </div>
      <div>
        <label htmlFor="bpm">BPM (batidas por minuto)</label>
        <Input
          type="number"
          name="bpm"
          min={30}
          max={300}
          defaultValue={cifra.bpm || ""}
          placeholder="Ex: 90 (opcional)"
        />
      </div>
      <MultSeletorContainer>
        <GuardaEscolhidos>
          {escolhidos.map((item) => (
            <p key={item._id}>
              {item.nome}
              <button
                type="button"
                className="remove"
                aria-label={`Remover categoria ${item.nome}`}
                onClick={() => removeSelect(item)}
              >
                X
              </button>
            </p>
          ))}
        </GuardaEscolhidos>
        <h3>Adicionar categoria</h3>
        <Input
          type="text"
          placeholder="Pesquisar a categoria"
          value={categoriaQuery}
          aria-label="Pesquisar categoria"
          onChange={(e) => setCategoriaQuery(e.target.value)}
        />
        {categoriaQuery && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCategoriaQuery("");
              setCategorias([]);
            }}
          >
            Limpar filtro
          </button>
        )}
        {categorias.map((item) => (
          <p
            key={item._id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(item);
              }
            }}
          >
            {item.nome}
          </p>
        ))}
      </MultSeletorContainer>
      <button className="btn">Salvar Cifra</button>
      <button type="button" className="btn btn-danger" aria-label="Excluir cifra" onClick={onRequestDelete}>
        <FiTrash2 size={16} /> Excluir cifra
      </button>
      <p>Utilize "!!!" para separar a cifra em duas colunas</p>
      <TextareaAutosize name="observacao" defaultValue={cifra.observacao} minRows={2} />
    </UpdateCifra>
  );
}
