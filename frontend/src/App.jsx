import { useState, useEffect } from 'react'

function App() {
  const [livros, setLivros] = useState([])
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [capaUrl, setCapaUrl] = useState('')
  
  const [sugestoes, setSugestoes] = useState([])
  const [carregandoBusca, setCarregandoBusca] = useState(false)
  const [mensagemStatus, setMensagemStatus] = useState('')

  const carregarLivros = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/livros')
      if (response.ok) {
        const data = await response.json()
        setLivros(data)
      }
    } catch (error) {
      console.error('Erro ao buscar livros salvos:', error)
    }
  }

  useEffect(() => {
    carregarLivros()
  }, [])

  const executarBusca = async () => {
    if (!titulo.trim()) {
      alert('Digite o nome do livro no campo de título antes de buscar!')
      return
    }
    setCarregandoBusca(true)
    setMensagemStatus('')
    setSugestoes([])

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/buscar-capa?q=${encodeURIComponent(titulo)}`)
      const data = await res.json()
      
      if (data.items && data.items.length > 0) {
        setSugestoes(data.items)
      } else {
        setMensagemStatus('Nenhum resultado encontrado para essa busca.')
      }
    } catch (err) {
      console.error('Erro na busca:', err)
      setMensagemStatus('Falha na comunicação com o servidor backend.')
    } finally {
      setCarregandoBusca(false)
    }
  }

  const selecionarLivro = (item) => {
    setTitulo(item.titulo)
    setAutor(item.autores)
    setCategoria(item.categoria)
    setCapaUrl(item.capa)
    setSugestoes([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo || !autor || !categoria) {
      alert('Por favor, preencha Título, Autor e Categoria!')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, autor, categoria, capa_url: capaUrl })
      })

      if (response.ok) {
        setTitulo('')
        setAutor('')
        setCategoria('')
        setCapaUrl('')
        setSugestoes([])
        setMensagemStatus('')
        carregarLivros()
      }
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '30px 15px', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Cabeçalho */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1e293b', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>📚 Clube do Livro</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Gerencie sua estante digital de forma simples e rápida</p>
        </header>

        {/* Formulário */}
        <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '18px', color: '#334155', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            Cadastrar Novo Livro
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Campo Título + Botão Busca */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Título do Livro</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Ex: O Idiota, O Hobbit..." 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={executarBusca} 
                  style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {carregandoBusca ? 'Buscando...' : 'Buscar Capa'}
                </button>
              </div>

              {mensagemStatus && (
                <div style={{ fontSize: '12px', color: '#e11d48', marginTop: '6px' }}>{mensagemStatus}</div>
              )}

              {/* Lista de Sugestões com Autor e Categoria Traduzidos */}
              {sugestoes.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  marginTop: '5px',
                  zIndex: 50,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                }}>
                  {sugestoes.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => selecionarLivro(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      {item.capa ? (
                        <img src={item.capa} alt={item.titulo} style={{ width: '40px', height: '58px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '58px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>Sem Capa</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{item.titulo}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>👤 {item.autores}</span>
                        <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontWeight: '500', display: 'inline-block', marginTop: '3px' }}>
                          🏷️ {item.categoria}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campos Autor e Categoria */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Autor</label>
                <input 
                  type="text" 
                  placeholder="Nome do autor" 
                  value={autor} 
                  onChange={(e) => setAutor(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>Categoria / Gênero</label>
                <input 
                  type="text" 
                  placeholder="Ex: Ficção, Romance..." 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* URL da Capa */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' }}>URL da Capa (Opcional)</label>
              <input 
                type="text" 
                placeholder="https://link-da-imagem.com/capa.jpg" 
                value={capaUrl} 
                onChange={(e) => setCapaUrl(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Preview da Capa Selecionada */}
            {capaUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px' }}>
                <img src={capaUrl} alt="Prévia" style={{ height: '60px', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>✓ Capa e informações vinculadas com sucesso!</span>
              </div>
            )}

            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
              Salvar na Minha Estante
            </button>
          </form>
        </div>

        {/* Estante de Livros */}
        <section>
          <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '15px' }}>Minha Estante ({livros.length})</h2>
          
          {livros.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', color: '#94a3b8' }}>
              Nenhum livro cadastrado na estante ainda.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
              {livros.map((livro) => (
                <div key={livro.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {livro.capa_url ? (
                    <img src={livro.capa_url} alt={livro.titulo} style={{ width: '110px', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '110px', height: '150px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: '#64748b', fontSize: '12px' }}>
                      Sem Capa
                    </div>
                  )}
                  <h3 style={{ fontSize: '14px', margin: '0 0 4px 0', color: '#0f172a', fontWeight: '600', lineHeight: '1.2' }}>{livro.titulo}</h3>
                  <p style={{ fontSize: '12px', margin: '0 0 6px 0', color: '#64748b' }}>{livro.autor}</p>
                  <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    {livro.categoria}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default App