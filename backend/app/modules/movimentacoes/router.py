from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.movimentacoes import service
from app.modules.movimentacoes.schemas import MovimentacaoCreate, MovimentacaoOut
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/movimentacoes", tags=["movimentacoes"])


@router.post(
    "/entradas", response_model=MovimentacaoOut, status_code=status.HTTP_201_CREATED
)
def registrar_entrada(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    try:
        return service.registrar_entrada(db, dados, usuario.id)
    except service.ProdutoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    except service.LocalizacaoNaoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Localização não encontrada"
        )


@router.post("/saidas", response_model=MovimentacaoOut, status_code=status.HTTP_201_CREATED)
def registrar_saida(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    try:
        return service.registrar_saida(db, dados, usuario.id)
    except service.ProdutoNaoEncontradoError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    except service.LocalizacaoNaoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Localização não encontrada"
        )
    except service.SaldoInsuficienteError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo insuficiente para saída"
        )


@router.get("/produtos/{produto_id}", response_model=list[MovimentacaoOut])
def listar_por_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.listar_por_produto(db, produto_id)
