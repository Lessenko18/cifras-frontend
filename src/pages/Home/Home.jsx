import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCifrasService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
import { AnCifra, HomeContainer } from "./HomeStyled";

export default function Home() {
  const [cifras, setCifras] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resCifras, resCategorias] = await Promise.all([
          getCifrasService(),
          getCategoriasService(),
        ]);
        setCifras(resCifras.data);
        setCategorias(resCategorias.data);
      } catch (err) {
        console.error("Erro ao carregar cifras:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <HomeContainer>
      {cifras.length > 0 ? (
        [...cifras]
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((cifra) => (
            <Link to={"/home/cifra/" + cifra._id} key={cifra._id}>
              <AnCifra>
                <div>
                  <h2>{cifra.nome}</h2>
                  <div>
                    {cifra.categorias.length > 0 &&
                      cifra.categorias.map((cat) => (
                        <span key={cat} style={{ marginRight: 8 }}>
                          {categorias.find((item) => item._id === cat)?.nome}
                        </span>
                      ))}
                  </div>
                </div>
              </AnCifra>
            </Link>
          ))
      ) : (
        <p>Nenhuma cifra cadastrada.</p>
      )}
    </HomeContainer>
  );
}
