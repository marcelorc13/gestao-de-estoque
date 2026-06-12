from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.estoque import service
from app.modules.estoque.schemas import (
    DepositoCreate,
    DepositoOut,
    LocalizacaoCreate,
    LocalizacaoOut,
    ResumoSaldoOut,
)

router = APIRouter(tags=["estoque"], dependencies=[Depends(get_current_user)])


@router.post("/depositos", response_model=DepositoOut, status_code=status.HTTP_201_CREATED)
def criar_deposito(dados: DepositoCreate, db: Session = Depends(get_db)):
    return service.criar_deposito(db, dados)


@router.get("/depositos", response_model=list[DepositoOut])
def listar_depositos(db: Session = Depends(get_db)):
    return service.listar_depositos(db)


@router.post("/localizacoes", response_model=LocalizacaoOut, status_code=status.HTTP_201_CREATED)
def criar_localizacao(dados: LocalizacaoCreate, db: Session = Depends(get_db)):
    try:
        return service.criar_localizacao(db, dados)
    except service.DepositoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Depósito não encontrado")


@router.get("/localizacoes", response_model=list[LocalizacaoOut])
def listar_localizacoes(deposito_id: int | None = None, db: Session = Depends(get_db)):
    return service.listar_localizacoes(db, deposito_id)


@router.get("/produtos/{produto_id}/saldo", response_model=ResumoSaldoOut)
def consultar_saldo(produto_id: int, db: Session = Depends(get_db)):
    try:
        return service.consultar_saldo_produto(db, produto_id)
    except service.ProdutoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
