import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AC1() {
  const navigate = useNavigate();

  const [livros, setLivros] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [buscandoCapa, setBuscandoCapa] = useState(false);

  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    carregarLivros();
  }, []);

  const carregarLivros = async () => {
    try {
      const response = await fetch(`${API_URL}/livros`);

      if (response.ok) {
        const data = await response.json();
        setLivros(data);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  };

  // Função recursiva para extrair Autor, Categoria e URL de Capa de qualquer JSON
  const extrairDadosDoLivro = (dados) => {
    let capa = '';
    let autorExtraido = '';
    let categoriaExtraida = '';

    const varrer = (obj) => {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj)) {
        const chaveLower = key.toLowerCase();

        // 1. Extração da Capa
        if (!capa) {
          if (
            typeof value === 'string' &&
            (value.startsWith('http://') || value.startsWith('https://')) &&
            (
              value.includes('jpg') ||
              value.includes('jpeg') ||
              value.includes('png') ||
              value.includes('covers') ||
              value.includes('books')
            )
          ) {
            capa = value;
          } else if (
            ['capa', 'capa_url', 'cover', 'thumbnail', 'imagelinks', 'imagem'].includes(chaveLower) &&
            value
          ) {
            if (typeof value === 'string') {
              capa = value;
            } else if (typeof value === 'object') {
              varrer(value);
            }
          }
        }

        // 2. Extração do Autor
        if (!autorExtraido) {
          if (
            ['autor', 'autores', 'author', 'authors', 'author_name'].includes(chaveLower) &&
            value
          ) {
            if (Array.isArray(value)) {
              autorExtraido = value.join(', ');
            } else if (typeof value === 'string') {
              autorExtraido = value;
            }
          }
        }

        // 3. Extração da Categoria
        if (!categoriaExtraida) {
          if (
            ['categoria', 'categorias', 'genero', 'genre', 'categories', 'subjects', 'subject'].includes(chaveLower) &&
            value
          ) {
            if (Array.isArray(value)) {
              categoriaExtraida = value[0];
            } else if (typeof value === 'string') {
              categoriaExtraida = value;
            }
          }
        }

        // Continua procurando dentro de objetos e arrays
        if (typeof value === 'object' && value !== null) {
          varrer(value);
        }
      }
    };

    varrer(dados);

    return {
      capa,
      autorExtraido,
      categoriaExtraida
    };
  };

  const handleBuscarCapa = async (e) => {
    if (e) e.preventDefault();

    if (!titulo.trim()) {
      alert('Por favor, digite o título do livro para buscar a capa.');
      return;
    }

    setBuscandoCapa(true);

    try {
      const res = await fetch(
        `${API_URL}/buscar-capa?q=${encodeURIComponent(titulo.trim())}`
      );

      if (res.ok) {
        const data = await res.json();

        console.log('Resposta do Backend:', data);

        const {
          capa,
          autorExtraido,
          categoriaExtraida
        } = extrairDadosDoLivro(data);

        if (capa) {
          setCapaUrl(capa);
        }

        if (autorExtraido) {
          setAutor(autorExtraido);
        }

        if (categoriaExtraida) {
          setCategoria(categoriaExtraida);
        }

        if (!capa && !autorExtraido && !categoriaExtraida) {
          alert(
            'Backend respondeu, mas nenhum dado do livro pôde ser extraído automaticamente.'
          );
        }
      } else {
        alert(
          `Erro na busca. Servidor respondeu com código: ${res.status}`
        );
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);

      alert(
        'Não foi possível conectar ao backend FastAPI para buscar os dados.'
      );
    } finally {
      setBuscandoCapa(false);
    }
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !autor.trim()) {
      alert('Por favor, preencha pelo menos o título e o autor.');
      return;
    }

    const novoLivro = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      categoria: categoria.trim() || 'Geral',
      capa_url: capaUrl.trim() || ''
    };

    try {
      const response = await fetch(`${API_URL}/livros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoLivro)
      });

      if (response.ok) {
        alert('Livro cadastrado com sucesso!');

        setTitulo('');
        setAutor('');
        setCategoria('');
        setCapaUrl('');

        carregarLivros();
      } else {
        alert('Erro ao cadastrar livro no servidor.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);

      alert('Não foi possível conectar ao servidor backend.');
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    >
      <button
        onClick={() => navigate('/home')}
        style={{
          marginBottom: '1.5rem',
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: '#f8f9fa'
        }}
      >
        ← Voltar ao Menu
      </button>

      <h2>AC1 — Cadastro de Livros e Estante Virtual</h2>

      <hr style={{ marginBottom: '2rem' }} />

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}
      >
        <form
          onSubmit={handleCadastrar}
          style={{
            flex: '1',
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <h3>Cadastrar Novo Livro</h3>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.3rem'
              }}
            >
              <strong>Título:</strong>
            </label>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Dom Casmurro"
                style={{
                  flex: '1',
                  padding: '0.6rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />

              <button
                type="button"
                onClick={handleBuscarCapa}
                disabled={buscandoCapa}
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: buscandoCapa ? 'not-allowed' : 'pointer',
                  opacity: buscandoCapa ? 0.7 : 1
                }}
              >
                {buscandoCapa ? 'A buscar...' : 'Buscar Capa'}
              </button>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.3rem'
              }}
            >
              <strong>Autor:</strong>
            </label>

            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ex: Machado de Assis"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.3rem'
              }}
            >
              <strong>Categoria:</strong>
            </label>

            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: Ficção, Romance, Terror"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.3rem'
              }}
            >
              <strong>URL da Capa (Opcional):</strong>
            </label>

            <input
              type="text"
              value={capaUrl}
              onChange={(e) => setCapaUrl(e.target.value)}
              placeholder="Preenchido ao buscar ou insira o link"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.8rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cadastrar Livro
          </button>
        </form>

        <div
          style={{
            width: '180px',
            textAlign: 'center'
          }}
        >
          <h4>Prévia da Capa</h4>

          {buscandoCapa ? (
            <p style={{ color: '#666' }}>
              A buscar capa...
            </p>
          ) : capaUrl ? (
            <img
              src={capaUrl}
              alt="Prévia da Capa"
              style={{
                width: '150px',
                height: '220px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          ) : (
            <div
              style={{
                width: '150px',
                height: '220px',
                backgroundColor: '#f0f0f0',
                borderRadius: '6px',
                border: '1px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#888',
                fontSize: '0.9rem',
                padding: '0.5rem'
              }}
            >
              Sem prévia de capa
            </div>
          )}
        </div>
      </div>

      <h3>Sua Estante</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}
      >
        {livros.length === 0 ? (
          <p>Nenhum livro cadastrado ainda.</p>
        ) : (
          livros.map((livro) => (
            <div
              key={livro.id || livro._id}
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '0.8rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {livro.capa_url ? (
                <img
                  src={livro.capa_url}
                  alt={livro.titulo}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    fontSize: '0.85rem'
                  }}
                >
                  Sem Capa
                </div>
              )}

              <h4
                style={{
                  margin: '0.5rem 0 0.2rem 0',
                  fontSize: '1rem'
                }}
              >
                {livro.titulo}
              </h4>

              <p
                style={{
                  margin: '0',
                  fontSize: '0.85rem',
                  color: '#666'
                }}
              >
                {livro.autor}
              </p>

              {livro.categoria && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#e2e3e5',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '3px',
                    marginTop: '0.3rem',
                    display: 'inline-block'
                  }}
                >
                  {livro.categoria}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}