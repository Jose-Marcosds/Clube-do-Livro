import json
import re
import ssl
import urllib.request
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pymysql
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="clube_do_livro",
        cursorclass=pymysql.cursors.DictCursor,
    )


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS livros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            autor VARCHAR(255) NOT NULL,
            categoria VARCHAR(100),
            capa_url TEXT,
            status VARCHAR(50) DEFAULT 'Disponível'
        )
    """)
    conn.commit()
    conn.close()


# Inicializa a tabela no MySQL ao iniciar a aplicação
init_db()


class LivroCreate(BaseModel):
    titulo: str
    autor: str
    categoria: str
    capa_url: Optional[str] = None


# Mapeamento de transliteração do alfabeto Cirílico para Latino
MAPA_CIRILICO = {
    "А": "A",
    "а": "a",
    "Б": "B",
    "б": "b",
    "В": "V",
    "в": "v",
    "Г": "G",
    "г": "g",
    "Д": "D",
    "д": "d",
    "Е": "E",
    "е": "e",
    "Ё": "Yo",
    "ё": "yo",
    "Ж": "Zh",
    "ж": "zh",
    "З": "Z",
    "з": "z",
    "И": "I",
    "и": "i",
    "Й": "Y",
    "й": "y",
    "К": "K",
    "к": "k",
    "Л": "L",
    "л": "l",
    "М": "M",
    "м": "m",
    "Н": "N",
    "н": "n",
    "О": "O",
    "о": "o",
    "П": "P",
    "п": "p",
    "Р": "R",
    "р": "r",
    "С": "S",
    "с": "s",
    "Т": "T",
    "т": "t",
    "У": "U",
    "у": "u",
    "Ф": "F",
    "ф": "f",
    "Х": "Kh",
    "х": "kh",
    "Ц": "Ts",
    "ц": "ts",
    "Ч": "Ch",
    "ч": "ch",
    "Ш": "Sh",
    "ш": "sh",
    "Щ": "Shch",
    "щ": "shch",
    "Ъ": "",
    "ъ": "",
    "Ы": "Y",
    "ы": "y",
    "Ь": "",
    "ь": "",
    "Э": "E",
    "э": "e",
    "Ю": "Yu",
    "ю": "yu",
    "Я": "Ya",
    "я": "ya",
}

AUTORES_CONHECIDOS = {
    "fyodor dostoevsky": "Fiódor Dostoiévski",
    "fyodor dostoyevsky": "Fiódor Dostoiévski",
    "fedor mihajlovic dostoevskij": "Fiódor Dostoiévski",
    "leo tolstoy": "Liev Tolstói",
    "lev tolstoy": "Liev Tolstói",
    "franz kafka": "Franz Kafka",
    "george orwell": "George Orwell",
    "j.r.r. tolkien": "J.R.R. Tolkien",
}

TRADUCOES_CATEGORIA = {
    "fiction": "Ficção",
    "classics": "Clássico",
    "romance": "Romance",
    "fantasy": "Fantasia",
    "science fiction": "Ficção Científica",
    "history": "História",
    "biography": "Biografia",
    "philosophy": "Filosofia",
    "psychology": "Psicologia",
    "self-help": "Desenvolvimento Pessoal",
}


def normalizar_autor(nome_raw: str) -> str:
    if not nome_raw:
        return "Autor Desconhecido"

    # 1. Transliterar se contiver caracteres cirílicos
    if re.search(r"[\u0400-\u04FF]", nome_raw):
        nome_transliterado = "".join(MAPA_CIRILICO.get(c, c) for c in nome_raw)
        # Ajustes finos para nomes russos populares
        if (
            "Dostoevsk" in nome_transliterado
            or "Dostoyevsk" in nome_transliterado
        ):
            return "Fiódor Dostoiévski"
        if "Tolstoy" in nome_transliterado or "Tolstoi" in nome_transliterado:
            return "Liev Tolstói"
        return nome_transliterado

    # 2. Verificar dicionário de autores conhecidos
    key = nome_raw.strip().lower()
    if key in AUTORES_CONHECIDOS:
        return AUTORES_CONHECIDOS[key]

    return nome_raw


def traduzir_categoria(cat_raw: str) -> str:
    if not cat_raw:
        return "Literatura"
    cat_lower = cat_raw.strip().lower()
    for key, val in TRADUCOES_CATEGORIA.items():
        if key in cat_lower:
            return val
    return cat_raw.title()


@app.get("/api/buscar-capa")
def buscar_capa(q: str):
    context = ssl._create_unverified_context()
    headers = {"User-Agent": "Mozilla/5.0"}

    # 1. Tentar Google Books
    url_google = f"https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(q)}&langRestrict=pt&maxResults=6"
    try:
        req = urllib.request.Request(url_google, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode())
            items = []
            if "items" in data:
                for item in data["items"]:
                    info = item.get("volumeInfo", {})
                    image_links = info.get("imageLinks", {})
                    capa = (
                        image_links.get("thumbnail")
                        or image_links.get("smallThumbnail")
                        or ""
                    )
                    if capa.startswith("http://"):
                        capa = capa.replace("http://", "https://")

                    autores = info.get("authors", ["Autor Desconhecido"])
                    autor_formatado = normalizar_autor(autores[0])
                    categorias = info.get("categories", [])
                    cat_final = (
                        traduzir_categoria(categorias[0])
                        if categorias
                        else "Literatura"
                    )

                    items.append({
                        "id": item.get("id"),
                        "titulo": info.get("title", "Sem título"),
                        "autores": autor_formatado,
                        "categoria": cat_final,
                        "capa": capa,
                    })
            if items:
                return {"items": items}
    except Exception as e:
        print("Google Books indisponível, usando Open Library:", e)

    # 2. Fallback Open Library (com normalização de autor)
    url_open_library = (
        f"https://openlibrary.org/search.json?q={urllib.parse.quote(q)}&limit=6"
    )
    try:
        req = urllib.request.Request(url_open_library, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode())
            items = []
            if "docs" in data:
                for doc in data["docs"]:
                    cover_i = doc.get("cover_i")
                    capa = (
                        f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg"
                        if cover_i
                        else ""
                    )

                    autores = doc.get("author_name", ["Autor Desconhecido"])
                    autor_formatado = normalizar_autor(autores[0])

                    subjects = doc.get("subject", [])
                    cat_final = (
                        traduzir_categoria(subjects[0])
                        if subjects
                        else "Literatura"
                    )

                    items.append({
                        "id": str(doc.get("key")),
                        "titulo": doc.get("title", "Sem título"),
                        "autores": autor_formatado,
                        "categoria": cat_final,
                        "capa": capa,
                    })
            return {"items": items}
    except Exception as e:
        return {"items": [], "error": str(e)}


@app.get("/api/livros")
def listar_livros():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM livros ORDER BY id DESC")
    livros = cursor.fetchall()
    conn.close()
    return livros


@app.post("/api/livros")
def cadastrar_livro(livro: LivroCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO livros (titulo, autor, categoria, capa_url) VALUES (%s, %s, %s, %s)",
        (livro.titulo, livro.autor, livro.categoria, livro.capa_url),
    )
    conn.commit()
    conn.close()
    return {"message": "Livro cadastrado com sucesso!"}