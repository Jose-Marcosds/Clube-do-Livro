import React, { useState } from 'react';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && senha) {
      onLogin();
    } else {
      alert('Por favor, preencha o e-mail e a palavra-passe.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', width: '300px' }}>
        <h2>Iniciar Sessão</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label>E-mail:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Palavra-passe:</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.6rem', cursor: 'pointer' }}>Entrar</button>
      </form>
    </div>
  );
}