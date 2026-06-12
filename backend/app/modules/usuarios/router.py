from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.usuarios import service
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import LoginRequest, TokenResponse, UsuarioCreate, UsuarioOut

router = APIRouter(tags=["usuarios"])


@router.post("/auth/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar(dados: UsuarioCreate, db: Session = Depends(get_db)):
    try:
        return service.registrar(db, dados)
    except service.EmailJaCadastradoError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")


@router.post("/auth/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    try:
        token = service.autenticar(db, dados.email, dados.senha)
    except service.CredenciaisInvalidasError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )
    return TokenResponse(access_token=token)


@router.get("/usuarios/me", response_model=UsuarioOut)
def me(usuario: Usuario = Depends(get_current_user)):
    return usuario
