from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios import repository
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UsuarioCreate


class CredenciaisInvalidasError(Exception):
    pass


class EmailJaCadastradoError(Exception):
    pass


def registrar(db: Session, dados: UsuarioCreate) -> Usuario:
    if repository.get_by_email(db, dados.email):
        raise EmailJaCadastradoError

    usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=hash_password(dados.senha),
    )
    return repository.create(db, usuario)


def autenticar(db: Session, email: str, senha: str) -> str:
    usuario = repository.get_by_email(db, email)
    if not usuario or not usuario.ativo or not verify_password(senha, usuario.senha_hash):
        raise CredenciaisInvalidasError

    return create_access_token(subject=str(usuario.id))
