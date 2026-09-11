import { useState, useEffect } from 'react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('usuarioLogado') === 'true'
  })

  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')

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
      console.error('Erro ao carregar livros:', error)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      carregarLivros()
    }
  }, [isLoggedIn])

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (loginEmail && loginSenha) {
      localStorage.setItem('usuarioLogado', 'true')
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    setIsLoggedIn(false)
  }

  const executarBusca = async () => {
    if (!titulo.trim()) {
      alert('Digite o título para buscar!')
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
        setMensagemStatus('Nenhum resultado encontrado.')
      }
    } catch (err) {
      console.error('Erro na busca:', err)
      setMensagemStatus('Falha ao conectar com o servidor.')
    } finally {
      setCarregandoBusca(false)
    }
  }

  const selecionarLivro = (item) => {
    setTitulo(item.titulo || '')
    setAutor(item.autores || '')
    setCategoria(item.categoria || '')
    setCapaUrl(item.capa || '')
    setSugestoes([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo || !autor || !categoria) {
      alert('Preencha Título, Autor e Categoria!')
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
      console.error('Erro ao cadastrar:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 1.5rem 0' }}>📚 Clube do Livro</h2>
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 'bold' }}>E-mail</label>
              <input 
                type="email" 
                placeholder="seu.email@exemplo.com"
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 'bold' }}>Senha</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={loginSenha} 
                onChange={(e) => setLoginSenha(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Botão Sair posicionado no canto superior direito */}
      <button 
        onClick={handleLogout} 
        style={{ 
          position: 'fixed', 
          top: '16px', 
          right: '20px', 
          backgroundColor: '#dc3545', 
          color: '#fff', 
          border: 'none', 
          padding: '0.35rem 0.75rem', 
          borderRadius: '4px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Sair
      </button>

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#2c3e50' }}>📚 Clube do Livro</h1>
      </header>

      <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', fontSize: '1.2rem', color: '#444' }}>Cadastrar Livro</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Título" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="button" onClick={executarBusca} disabled={carregandoBusca} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {carregandoBusca ? 'Buscando...' : 'Buscar Capa'}
            </button>
          </div>

          {mensagemStatus && <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>{mensagemStatus}</p>}

          {sugestoes.length > 0 && (
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
              {sugestoes.map((item, idx) => (
                <div key={idx} onClick={() => selecionarLivro(item)} style={{ padding: '0.4rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                  <strong>{item.titulo}</strong> — {item.autores}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Autor" 
              value={autor} 
              onChange={(e) => setAutor(e.target.value)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" 
              placeholder="Categoria" 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <input 
            type="text" 
            placeholder="URL da Capa (Opcional)" 
            value={capaUrl} 
            onChange={(e) => setCapaUrl(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
          />

          <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Salvar na Estante
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ textAlign: 'center', fontSize: '1.2rem', color: '#444' }}>Minha Estante ({livros.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', justifyContent: 'center' }}>
          {livros.map((item) => (
            <div key={item.id} style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              {item.capa_url ? (
                <img src={item.capa_url} alt={item.titulo} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '2px' }} />
              ) : (
                <div style={{ width: '100%', height: '160px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.75rem' }}>
                  Sem Capa
                </div>
              )}
              <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.4rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.titulo}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}