from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.estoque.router import router as estoque_router
from app.modules.movimentacoes.router import router as movimentacoes_router
from app.modules.produtos.router import router as produtos_router
from app.modules.usuarios.router import router as usuarios_router

app = FastAPI(title="Sistema de Gerenciamento de Estoque")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router)
app.include_router(produtos_router)
app.include_router(estoque_router)
app.include_router(movimentacoes_router)


@app.get("/health")
def health():
    return {"status": "ok"}
