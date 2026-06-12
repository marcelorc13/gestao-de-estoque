from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.produtos.models import Produto


def get_by_id(db: Session, produto_id: int) -> Produto | None:
    return db.get(Produto, produto_id)


def get_by_codigo(db: Session, codigo: str) -> Produto | None:
    return db.scalar(select(Produto).where(Produto.codigo == codigo))


def list_all(db: Session, apenas_ativos: bool = False) -> list[Produto]:
    stmt = select(Produto)
    if apenas_ativos:
        stmt = stmt.where(Produto.ativo.is_(True))
    return list(db.scalars(stmt))


def create(db: Session, produto: Produto) -> Produto:
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


def update(db: Session, produto: Produto, dados: dict) -> Produto:
    for campo, valor in dados.items():
        setattr(produto, campo, valor)
    db.commit()
    db.refresh(produto)
    return produto
