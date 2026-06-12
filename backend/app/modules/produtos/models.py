from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    unidade_medida: Mapped[str] = mapped_column(String(10), nullable=False)
    estoque_minimo: Mapped[int] = mapped_column(Numeric, default=0, nullable=False)
    controla_lote: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    controla_validade: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    controla_serie: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
