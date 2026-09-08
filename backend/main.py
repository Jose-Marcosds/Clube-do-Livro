import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Permite que o React faça chamadas para o Python sem ser bloqueado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estrutura do livro que vem do front-end
class LivroCreate(BaseModel):
    titulo: str
    autor: str
    categoria: str

# Conexão com o Banco de Dados SQLite
def get_db_connection():
    conn = sqlite3.connect("meubanco.db")
    conn.row_factory = sqlite3.Row
    return conn

# Cria a tabela de livros se ela não existir
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS livros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            categoria TEXT NOT NULL,
            status TEXT DEFAULT 'Disponível'
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Rota para LISTAR os livros
@app.get("/api/livros")
def listar_livros():
    conn = get_db_connection()
    cursor = conn.cursor()
    livros = cursor.execute("SELECT * FROM livros ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(livro) for livro in livros]

# Rota para CADASTRAR um novo livro (AC1)
@app.post("/api/livros")
def cadastrar_livro(livro: LivroCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO livros (titulo, autor, categoria) VALUES (?, ?, ?)",
        (livro.titulo, livro.autor, livro.categoria)
    )
    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()
    
    return {
        "id": novo_id,
        "titulo": livro.titulo,
        "autor": livro.autor,
        "categoria": livro.categoria,
        "status": "Disponível"
    }