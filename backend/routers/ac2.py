from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Optional
import sqlite3

router = APIRouter(prefix="/api", tags=["AC2"])

DB_NAME = "meubanco.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_ac2_db():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        colunas_necessarias = {
            "categoriaLeitura": "TEXT DEFAULT 'tenho'",
            "dataInicio": "TEXT DEFAULT ''",
            "dataFim": "TEXT DEFAULT ''",
            "avaliacao": "REAL DEFAULT 0"
        }
        
        cursor.execute("PRAGMA table_info(livros)")
        colunas_existentes = [col[1] for col in cursor.fetchall()]
        
        for coluna, tipo in colunas_necessarias.items():
            if coluna not in colunas_existentes:
                cursor.execute(f"ALTER TABLE livros ADD COLUMN {coluna} {tipo}")
        
        conn.commit()
    finally:
        conn.close()

init_ac2_db()

class LivroUpdateAC2(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: Optional[int] = None
    titulo: Optional[str] = None
    autor: Optional[str] = None
    categoria: Optional[str] = None
    genero: Optional[str] = None
    capa_url: Optional[str] = None
    categoriaLeitura: Optional[str] = 'tenho'
    dataInicio: Optional[str] = ''
    dataFim: Optional[str] = ''
    avaliacao: Optional[float] = 0.0

@router.get("/livros")
def listar_livros():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM livros")
        livros = cursor.fetchall()
        
        resultado = []
        for livro in livros:
            item = dict(livro)
            item["categoriaLeitura"] = item.get("categoriaLeitura") or "tenho"
            item["dataInicio"] = item.get("dataInicio") or ""
            item["dataFim"] = item.get("dataFim") or ""
            item["avaliacao"] = item.get("avaliacao") if item.get("avaliacao") is not None else 0.0
            resultado.append(item)
            
        return resultado
    finally:
        conn.close()

@router.put("/livros/{livro_id}")
def atualizar_livro(livro_id: int, livro: LivroUpdateAC2):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM livros WHERE id = ?", (livro_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        sql = """
            UPDATE livros 
            SET categoriaLeitura = ?, dataInicio = ?, dataFim = ?, avaliacao = ?
            WHERE id = ?
        """
        cursor.execute(sql, (
            livro.categoriaLeitura or 'tenho',
            livro.dataInicio or '',
            livro.dataFim or '',
            livro.avaliacao if livro.avaliacao is not None else 0.0,
            livro_id
        ))
        conn.commit()
        
        return {"message": "Livro atualizado com sucesso!", "id": livro_id}
    finally:
        conn.close()