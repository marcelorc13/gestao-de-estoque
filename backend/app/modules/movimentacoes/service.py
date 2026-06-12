from sqlalchemy.orm import Session

from app.modules.estoque import repository as estoque_repository
from app.modules.estoque.models import SaldoEstoque
from app.modules.movimentacoes import repository
from app.modules.movimentacoes.models import Movimentacao, TipoMovimentacao
from app.modules.movimentacoes.schemas import MovimentacaoCreate
from app.modules.produtos import repository as produtos_repository


class ProdutoNaoEncontradoError(Exception):
    pass


class LocalizacaoNaoEncontradaError(Exception):
    pass


class SaldoInsuficienteError(Exception):
    pass


def _validar_produto_e_localizacao(db: Session, produto_id: int, localizacao_id: int) -> None:
    if not produtos_repository.get_by_id(db, produto_id):
        raise ProdutoNaoEncontradoError
    if not estoque_repository.get_localizacao(db, localizacao_id):
        raise LocalizacaoNaoEncontradaError


def registrar_entrada(
    db: Session, dados: MovimentacaoCreate, usuario_id: int
) -> Movimentacao:
    _validar_produto_e_localizacao(db, dados.produto_id, dados.localizacao_id)

    saldo = estoque_repository.get_saldo_for_update(db, dados.produto_id, dados.localizacao_id)
    if saldo is None:
        saldo = estoque_repository.create_saldo(
            db,
            SaldoEstoque(
                produto_id=dados.produto_id,
                localizacao_id=dados.localizacao_id,
                quantidade=0,
            ),
        )

    saldo.quantidade += dados.quantidade

    movimentacao = repository.create(
        db,
        Movimentacao(
            tipo=TipoMovimentacao.ENTRADA,
            produto_id=dados.produto_id,
            localizacao_id=dados.localizacao_id,
            usuario_id=usuario_id,
            quantidade=dados.quantidade,
            motivo=dados.motivo,
        ),
    )

    db.commit()
    db.refresh(movimentacao)
    return movimentacao


def registrar_saida(db: Session, dados: MovimentacaoCreate, usuario_id: int) -> Movimentacao:
    _validar_produto_e_localizacao(db, dados.produto_id, dados.localizacao_id)

    saldo = estoque_repository.get_saldo_for_update(db, dados.produto_id, dados.localizacao_id)
    if saldo is None or saldo.quantidade < dados.quantidade:
        raise SaldoInsuficienteError

    saldo.quantidade -= dados.quantidade

    movimentacao = repository.create(
        db,
        Movimentacao(
            tipo=TipoMovimentacao.SAIDA,
            produto_id=dados.produto_id,
            localizacao_id=dados.localizacao_id,
            usuario_id=usuario_id,
            quantidade=dados.quantidade,
            motivo=dados.motivo,
        ),
    )

    db.commit()
    db.refresh(movimentacao)
    return movimentacao


def listar_por_produto(db: Session, produto_id: int) -> list[Movimentacao]:
    return repository.list_by_produto(db, produto_id)
