from sqlalchemy.orm import Session

from app.modules.estoque import repository
from app.modules.estoque.models import Deposito, Localizacao
from app.modules.estoque.schemas import DepositoCreate, LocalizacaoCreate, ResumoSaldoOut, SaldoOut
from app.modules.produtos import repository as produtos_repository


class DepositoNaoEncontradoError(Exception):
    pass


class ProdutoNaoEncontradoError(Exception):
    pass


def criar_deposito(db: Session, dados: DepositoCreate) -> Deposito:
    deposito = Deposito(**dados.model_dump())
    return repository.create_deposito(db, deposito)


def listar_depositos(db: Session) -> list[Deposito]:
    return repository.list_depositos(db)


def criar_localizacao(db: Session, dados: LocalizacaoCreate) -> Localizacao:
    if not repository.get_deposito(db, dados.deposito_id):
        raise DepositoNaoEncontradoError

    localizacao = Localizacao(**dados.model_dump())
    return repository.create_localizacao(db, localizacao)


def listar_localizacoes(db: Session, deposito_id: int | None = None) -> list[Localizacao]:
    return repository.list_localizacoes(db, deposito_id)


def consultar_saldo_produto(db: Session, produto_id: int) -> ResumoSaldoOut:
    produto = produtos_repository.get_by_id(db, produto_id)
    if not produto:
        raise ProdutoNaoEncontradoError

    saldos = repository.list_saldos_por_produto(db, produto_id)
    resultado = []
    quantidade_total = 0
    for saldo in saldos:
        localizacao = repository.get_localizacao(db, saldo.localizacao_id)
        quantidade_total += saldo.quantidade
        resultado.append(
            SaldoOut(
                produto_id=saldo.produto_id,
                localizacao_id=saldo.localizacao_id,
                deposito_id=localizacao.deposito_id,
                quantidade=saldo.quantidade,
            )
        )

    return ResumoSaldoOut(
        produto_id=produto_id,
        quantidade_total=quantidade_total,
        estoque_minimo=produto.estoque_minimo,
        abaixo_minimo=quantidade_total < produto.estoque_minimo,
        saldos=resultado,
    )
