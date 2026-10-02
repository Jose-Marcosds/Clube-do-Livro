import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sqlite3

router = APIRouter(
    prefix="/api",
    tags=["AC1 - Cadastro e Estante"]
)

def get_db_connection():
    conn = sqlite3.connect("meubanco.db")
    conn.row_factory = sqlite3.Row
    return conn

# Aceita tanto 'genero' quanto 'categoria' no JSON recebido do Frontend
class LivroAC1(BaseModel):
    titulo: str
    autor: str
    genero: Optional[str] = None
    categoria: Optional[str] = None
    capa_url: Optional[str] = ''

@router.get("/livros")
def listar_livros():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM livros ORDER BY id DESC")
        livros = [dict(row) for row in cursor.fetchall()]
        return livros
    finally:
        conn.close()

@router.post("/livros")
def cadastrar_livro(livro: LivroAC1):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Pega 'genero' ou 'categoria', garantindo fallback se nenhum for enviado
        genero_final = livro.genero or livro.categoria or 'Geral'
        
        # Insere apenas nas colunas existentes na tabela 'livros'
        sql = """
            INSERT INTO livros (titulo, autor, categoria, capa_url)
            VALUES (?, ?, ?, ?)
        """
        cursor.execute(sql, (livro.titulo, livro.autor, genero_final, livro.capa_url))
        conn.commit()
        novo_id = cursor.lastrowid
        
        return {"id": novo_id, "message": "Livro cadastrado com sucesso!"}
    finally:
        conn.close()

@router.get("/buscar-capa")
async def buscar_capa_externa(q: Optional[str] = None, titulo: Optional[str] = None):
    termo_busca = q or titulo
    if not termo_busca:
        raise HTTPException(status_code=400, detail="Termo de busca não fornecido")

    url = f"https://openlibrary.org/search.json?q={termo_busca}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de comunicação com a API externa: {str(e)}")

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Erro ao consultar Open Library")

    dados = response.json()
    docs = dados.get("docs", [])

    if not docs:
        raise HTTPException(status_code=404, detail="Nenhum livro encontrado")

    primeiro = docs[0]
    capa_id = primeiro.get("cover_i")

    # Tenta obter o gênero/assunto em múltiplos campos retornados pela Open Library
    assuntos = (
        primeiro.get("subject") or 
        primeiro.get("subject_facet") or 
        primeiro.get("subjects") or 
        []
    )
    
    # Extrai a primeira categoria ou atribui um valor padrão caso a API não retorne dados de assunto
    genero_encontrado = assuntos[0] if (isinstance(assuntos, list) and len(assuntos) > 0) else "Geral"

    # Trata autores retornados em formato de lista
    autores = primeiro.get("author_name", ["Autor desconhecido"])
    autor_final = autores[0] if isinstance(autores, list) else autores

    return {
        "titulo": primeiro.get("title", termo_busca),
        "autor": autor_final,
        "genero": genero_encontrado,
        "categoria": genero_encontrado,  # Mantido para retrocompatibilidade
        "capa_url": f"https://covers.openlibrary.org/b/id/{capa_id}-L.jpg" if capa_id else ""
    }