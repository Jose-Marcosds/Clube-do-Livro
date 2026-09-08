import { useState, useEffect } from 'react'

function App() {
  const [livros, setLivros] = useState([])
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [categoria, setCategoria] = useState('')

  const carregarLivros = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/livros')
      const data = await response.json()
      setLivros(data)
    } catch (error) {
      console.error('Erro ao buscar livros:', error)
    }
  }

  useEffect(() => {
    carregarLivros()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo || !autor || !categoria) return

    try {
      const response = await fetch('http://127.0.0.1:8000/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, autor, categoria })
      })

      if (response.ok) {
        setTitulo('')
        setAutor('')
        setCategoria('')
        carregarLivros()
      }
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Clube do Livro - AC1</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Cadastrar Novo Livro</h3>
        <input 
          type="text" 
          placeholder="Título do Livro" 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" 
          placeholder="Autor" 
          value={autor} 
          onChange={(e) => setAutor(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" 
          placeholder="Categoria (ex: Romance, Ficção)" 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Cadastrar Livro
        </button>
      </form>

      <hr />

      <h2>Livros Cadastrados</h2>
      {livros.length === 0 ? (
        <p>Nenhum livro cadastrado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {livros.map((livro) => (
            <li key={livro.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
              <strong>{livro.titulo}</strong> - {livro.autor} <em>({livro.categoria})</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App