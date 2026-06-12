from sqlalchemy.orm import Session

from app.modules.produtos import repository
from app.modules.produtos.models import Produto
from app.modules.produtos.schemas import ProdutoCreate, ProdutoUpdate


class CodigoJaCadastradoError(Exception):
    pass


class ProdutoNaoEncontradoError(Exception):
    pass


def criar(db: Session, dados: ProdutoCreate) -> Produto:
    if repository.get_by_codigo(db, dados.codigo):
        raise CodigoJaCadastradoError

    produto = Produto(**dados.model_dump())
    return repository.create(db, produto)


def listar(db: Session, apenas_ativos: bool = False) -> list[Produto]:
    return repository.list_all(db, apenas_ativos)


def obter(db: Session, produto_id: int) -> Produto:
    produto = repository.get_by_id(db, produto_id)
    if not produto:
        raise ProdutoNaoEncontradoError
    return produto


def atualizar(db: Session, produto_id: int, dados: ProdutoUpdate) -> Produto:
    produto = obter(db, produto_id)
    atualizacoes = dados.model_dump(exclude_unset=True)
    return repository.update(db, produto, atualizacoes)
