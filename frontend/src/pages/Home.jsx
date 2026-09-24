import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Painel do Projeto — Clube do Livro</h1>
      <p>Selecione a secção que deseja aceder:</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
        {/* Card AC1 */}
        <div 
          onClick={() => navigate('/ac1')}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '2rem',
            cursor: 'pointer',
            width: '220px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <h2>AC1</h2>
          <p>Cadastro de Livros e Estante Virtual</p>
        </div>

        {/* Card AC2 */}
        <div 
          onClick={() => navigate('/ac2')}
          style={{
            border: '1px solid #007bff',
            borderRadius: '8px',
            padding: '2rem',
            cursor: 'pointer',
            width: '220px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <h2>AC2</h2>
          <p>Gestão de Leitura (Quero ler, Lendo, Lido)</p>
        </div>
      </div>
    </div>
  );
}
