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
  FiltersContainer,
  FilterInput,
  FilterSelect,
} from "./HomeStyled";

const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function Home() {
  const [cifras, setCifras] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Filtros
  const [searchNome, setSearchNome] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // Paginação
  const [itensPerpage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  //  FILTRO
  const cifrasFiltradas = cifras.filter((cifra) => {
    const matchNome = normalize(cifra.nome).includes(normalize(searchNome));

    const matchCategoria =
      !categoriaFiltro || cifra.categorias?.includes(categoriaFiltro);

    return matchNome && matchCategoria;
  });

  // Reset de página ao filtrar
  useEffect(() => {
    setCurrentPage(0);
  }, [searchNome, categoriaFiltro]);

  // Paginação baseada no FILTRO
  const pages = Math.ceil(cifrasFiltradas.length / itensPerpage);
  const startIndex = currentPage * itensPerpage;
  const endIndex = startIndex + itensPerpage;
  const cifraPaginated = cifrasFiltradas.slice(startIndex, endIndex);

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

        setCifras(resCifras.data || []);
        setCategorias(resCategorias.data || []);
      } catch (err) {
        console.error("Erro ao carregar cifras:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <HomeContainer>
      {/* FILTRO */}
      <FiltersContainer>
        <FilterInput
          type="text"
          placeholder="Pesquisar música"
          value={searchNome}
          onChange={(e) => setSearchNome(e.target.value)}
        />

        <FilterSelect
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.nome}
            </option>
          ))}
        </FilterSelect>
      </FiltersContainer>

      {/* LISTAGEM */}
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
                      {cifra.categorias?.map((cat) => (
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
        <p>Nenhuma cifra encontrada.</p>
      )}
    </HomeContainer>
  );
}
