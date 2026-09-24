import React from 'react';
import { useNavigate } from 'react-router-dom';

export function AC2() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/home')} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Voltar ao Menu
      </button>
      <h2>AC2 — Estado de Leitura</h2>
      <p>Selecione um livro para atualizar o estado de leitura (Quero ler / Lendo / Lido).</p>
    </div>
  );
}