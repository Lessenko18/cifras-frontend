import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCifrasService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
import {
  AnCifra,
  HomeContainer,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
} from "./HomeStyled";

export default function Home() {
  const [cifras, setCifras] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Paginação
  const [itensPerpage, setItensPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = Math.ceil(cifras.length / itensPerpage);
  const startIndex = currentPage * itensPerpage;
  const endIndex = startIndex + itensPerpage;
  const cifraPaginated = cifras.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 0 && page < pages) {
      setCurrentPage(page);
    }
  };

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
      {cifraPaginated.length > 0 ? (
        <>
          {[...cifraPaginated]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((cifra) => (
              <Link to={"/home/cifra/" + cifra._id} key={cifra._id}>
                <AnCifra>
                  <div>
                    <h2>{cifra.nome}</h2>
                    <div>
                      {cifra.categorias &&
                        cifra.categorias.length > 0 &&
                        cifra.categorias.map((cat) => (
                          <span
                            key={`${cifra._id}-${cat}`}
                            style={{ marginRight: 8 }}
                          >
                            {categorias.find((item) => item._id === cat)?.nome}
                          </span>
                        ))}
                    </div>
                  </div>
                </AnCifra>
              </Link>
            ))}

          {/* PAGINAÇÃO */}
          {pages > 1 && (
            <PaginationContainer>
              <PaginationButton
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </PaginationButton>

              <PaginationInfo>
                Página {currentPage + 1} de {pages}
              </PaginationInfo>

              <PaginationButton
                disabled={currentPage + 1 === pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <p>Nenhuma cifra cadastrada.</p>
      )}
    </HomeContainer>
  );
}
