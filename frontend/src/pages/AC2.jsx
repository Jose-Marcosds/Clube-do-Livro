import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AC2() {
  const navigate = useNavigate();
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('tenho');

  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    carregarLivros();
  }, []);

  const carregarLivros = async () => {
    try {
      const response = await fetch(`${API_URL}/livros`);
      if (response.ok) {
        const data = await response.json();
        const livrosFormatados = data.map(l => ({
          ...l,
          categoriaLeitura: l.categoriaLeitura || 'tenho',
          dataInicio: l.dataInicio || '',
          dataFim: l.dataFim || '',
          avaliacao: l.avaliacao !== undefined ? l.avaliacao : 0
        }));
        setLivros(livrosFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  };
const atualizarLivro = async (id, novosDados) => {
    const livroAtual = livros.find(l => (l.id || l._id) === id);
    if (!livroAtual) return;

    const payloadCompleto = {
      ...livroAtual,
      ...novosDados
    };

    const livrosAtualizados = livros.map(livro => {
      if ((livro.id || livro._id) === id) {
        return payloadCompleto;
      }
      return livro;
    });
    setLivros(livrosAtualizados);

    if (livroSelecionado && (livroSelecionado.id || livroSelecionado._id) === id) {
      setLivroSelecionado(payloadCompleto);
    }

    try {
      await fetch(`\({API_URL}/livros/\){id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadCompleto)
      });
    } catch (err) {
      console.error('Erro ao atualizar no servidor:', err);
    }
  };

  const getRotuloAvaliacao = (nota) => {
    const val = parseFloat(nota);
    if (val === 0 || val === 0.5) return '(Muito ruim)';
    if (val === 1 || val === 1.5) return '(Ruim)';
    if (val === 2 || val === 2.5) return '(Razoável)';
    if (val === 3 || val === 3.5) return '(Bom)';
    if (val === 4 || val === 4.5) return '(Muito bom)';
    if (val === 5) return '(Perfeito)';
    return '';
  };

  const livrosFiltrados = livros.filter(l => l.categoriaLeitura === abaAtiva);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
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

      <h2>AC2 — Categorias de Leitura e Avaliações</h2>
      <hr style={{ marginBottom: '1.5rem' }} />

      {/* Navegação entre as 4 Categorias */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
        {[
          { id: 'tenho', rotulo: 'Tenho' },
          { id: 'quero_ler', rotulo: 'Quero ler' },
          { id: 'lendo', rotulo: 'Lendo' },
          { id: 'lido', rotulo: 'Lido' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setAbaAtiva(cat.id)}
            style={{
              padding: '0.7rem 1.2rem',
              border: 'none',
              borderBottom: abaAtiva === cat.id ? '3px solid #007bff' : '3px solid transparent',
              backgroundColor: abaAtiva === cat.id ? '#e7f1ff' : 'transparent',
              color: abaAtiva === cat.id ? '#007bff' : '#555',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '1rem'
            }}
          >
            {cat.rotulo} ({livros.filter(l => l.categoriaLeitura === cat.id).length})
          </button>
        ))}
      </div>

      {/* Lista de Livros da Categoria Ativa */}
      {livrosFiltrados.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Nenhum livro na categoria "{abaAtiva === 'tenho' ? 'Tenho' : abaAtiva === 'quero_ler' ? 'Quero ler' : abaAtiva === 'lendo' ? 'Lendo' : 'Lido'}".
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {livrosFiltrados.map((livro) => {
            const idLivro = livro.id || livro._id;
            return (
              <div 
                key={idLivro}
                onClick={() => setLivroSelecionado(livro)}
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '0.8rem', 
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.1s ease-in-out'
                }}
              >
                {livro.capa_url ? (
                  <img 
                    src={livro.capa_url} 
                    alt={livro.titulo} 
                    style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '210px', backgroundColor: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '0.85rem' }}>
                    Sem Capa
                  </div>
                )}
                <h4 style={{ margin: '0.6rem 0 0.2rem 0', fontSize: '0.95rem' }}>{livro.titulo}</h4>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>{livro.autor}</p>
                {livro.categoriaLeitura === 'lido' && livro.avaliacao > 0 && (
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#ff9800' }}>
                    ★ {livro.avaliacao} {getRotuloAvaliacao(livro.avaliacao)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal/Tela de Opções ao Clicar no Livro */}
      {livroSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setLivroSelecionado(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {livroSelecionado.capa_url && (
                <img src={livroSelecionado.capa_url} alt={livroSelecionado.titulo} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <div>
                <h3 style={{ margin: '0 0 0.3rem 0' }}>{livroSelecionado.titulo}</h3>
                <p style={{ margin: 0, color: '#666' }}>{livroSelecionado.autor}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Categoria / Status do Livro:
                </label>
                <select
                  value={livroSelecionado.categoriaLeitura}
                  onChange={(e) => atualizarLivro(livroSelecionado.id || livroSelecionado._id, { categoriaLeitura: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem' }}
                >
                  <option value="tenho">Tenho</option>
                  <option value="quero_ler">Quero ler</option>
                  <option value="lendo">Lendo</option>
                  <option value="lido">Lido</option>
                </select>
              </div>

              {/* Opções exibidas apenas quando marcado como "Lido" */}
              {livroSelecionado.categoriaLeitura === 'lido' && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Detalhes da Leitura</h4>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>Data de Início:</label>
                    <input 
                      type="date" 
                      value={livroSelecionado.dataInicio} 
                      onChange={(e) => atualizarLivro(livroSelecionado.id || livroSelecionado._id, { dataInicio: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>Data de Conclusão:</label>
                    <input 
                      type="date" 
                      value={livroSelecionado.dataFim} 
                      onChange={(e) => atualizarLivro(livroSelecionado.id || livroSelecionado._id, { dataFim: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>Avaliação por Estrelas:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <select
                        value={livroSelecionado.avaliacao}
                        onChange={(e) => atualizarLivro(livroSelecionado.id || livroSelecionado._id, { avaliacao: parseFloat(e.target.value) })}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value={0}>0 ★</option>
                        <option value={0.5}>0.5 ★</option>
                        <option value={1}>1 ★</option>
                        <option value={1.5}>1.5 ★</option>
                        <option value={2}>2 ★</option>
                        <option value={2.5}>2.5 ★</option>
                        <option value={3}>3 ★</option>
                        <option value={3.5}>3.5 ★</option>
                        <option value={4}>4 ★</option>
                        <option value={4.5}>4.5 ★</option>
                        <option value={5}>5 ★</option>
                      </select>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                        {getRotuloAvaliacao(livroSelecionado.avaliacao)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setLivroSelecionado(null)}
                style={{
                  padding: '0.7rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}