from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.estoque.models import Deposito, Localizacao, SaldoEstoque


def get_deposito(db: Session, deposito_id: int) -> Deposito | None:
    return db.get(Deposito, deposito_id)


def list_depositos(db: Session) -> list[Deposito]:
    return list(db.scalars(select(Deposito)))


def create_deposito(db: Session, deposito: Deposito) -> Deposito:
    db.add(deposito)
    db.commit()
    db.refresh(deposito)
    return deposito


def get_localizacao(db: Session, localizacao_id: int) -> Localizacao | None:
    return db.get(Localizacao, localizacao_id)


def list_localizacoes(db: Session, deposito_id: int | None = None) -> list[Localizacao]:
    stmt = select(Localizacao)
    if deposito_id is not None:
        stmt = stmt.where(Localizacao.deposito_id == deposito_id)
    return list(db.scalars(stmt))


def create_localizacao(db: Session, localizacao: Localizacao) -> Localizacao:
    db.add(localizacao)
    db.commit()
    db.refresh(localizacao)
    return localizacao


def get_saldo_for_update(db: Session, produto_id: int, localizacao_id: int) -> SaldoEstoque | None:
    """Locks the saldo row (SELECT FOR UPDATE) for entrada/saída transactions."""
    stmt = (
        select(SaldoEstoque)
        .where(
            SaldoEstoque.produto_id == produto_id,
            SaldoEstoque.localizacao_id == localizacao_id,
        )
        .with_for_update()
    )
    return db.scalar(stmt)


def create_saldo(db: Session, saldo: SaldoEstoque) -> SaldoEstoque:
    db.add(saldo)
    db.flush()
    return saldo


def list_saldos_por_produto(db: Session, produto_id: int) -> list[SaldoEstoque]:
    stmt = select(SaldoEstoque).where(SaldoEstoque.produto_id == produto_id)
    return list(db.scalars(stmt))
