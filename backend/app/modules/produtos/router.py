from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.produtos import service
from app.modules.produtos.schemas import ProdutoCreate, ProdutoOut, ProdutoUpdate

router = APIRouter(prefix="/produtos", tags=["produtos"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=ProdutoOut, status_code=status.HTTP_201_CREATED)
def criar(dados: ProdutoCreate, db: Session = Depends(get_db)):
    try:
        return service.criar(db, dados)
    except service.CodigoJaCadastradoError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Código já cadastrado")


@router.get("", response_model=list[ProdutoOut])
def listar(apenas_ativos: bool = False, db: Session = Depends(get_db)):
    return service.listar(db, apenas_ativos)


@router.get("/{produto_id}", response_model=ProdutoOut)
def obter(produto_id: int, db: Session = Depends(get_db)):
    try:
        return service.obter(db, produto_id)
    except service.ProdutoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")


@router.patch("/{produto_id}", response_model=ProdutoOut)
def atualizar(produto_id: int, dados: ProdutoUpdate, db: Session = Depends(get_db)):
    try:
        return service.atualizar(db, produto_id, dados)
    except service.ProdutoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
