from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.movimentacoes.models import Movimentacao


def create(db: Session, movimentacao: Movimentacao) -> Movimentacao:
    db.add(movimentacao)
    db.flush()
    return movimentacao


def list_by_produto(db: Session, produto_id: int) -> list[Movimentacao]:
    stmt = (
        select(Movimentacao)
        .where(Movimentacao.produto_id == produto_id)
        .order_by(Movimentacao.criado_em.desc())
    )
    return list(db.scalars(stmt))
