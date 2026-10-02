from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from routers import ac1

app = FastAPI(title="Backend Clube do Livro")

# Permite chamadas do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa o banco de dados SQLite
def init_db():
    conn = sqlite3.connect("meubanco.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS livros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            categoria TEXT,
            capa_url TEXT,
            categoriaLeitura TEXT DEFAULT 'tenho',
            dataInicio TEXT DEFAULT '',
            dataFim TEXT DEFAULT '',
            avaliacao REAL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Inclui o módulo isolado da AC1
app.include_router(ac1.router)

@app.get("/")
def home():
    return {"status": "Servidor rodando e rotas da AC1 ativas!"}