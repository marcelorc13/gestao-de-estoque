from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Deposito(Base):
    __tablename__ = "depositos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)

    localizacoes: Mapped[list["Localizacao"]] = relationship(back_populates="deposito")


class Localizacao(Base):
    __tablename__ = "localizacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    deposito_id: Mapped[int] = mapped_column(ForeignKey("depositos.id"), nullable=False)
    codigo: Mapped[str] = mapped_column(String(50), nullable=False)

    deposito: Mapped["Deposito"] = relationship(back_populates="localizacoes")

    __table_args__ = (UniqueConstraint("deposito_id", "codigo", name="uq_localizacao_deposito_codigo"),)


class SaldoEstoque(Base):
    __tablename__ = "saldos_estoque"

    id: Mapped[int] = mapped_column(primary_key=True)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produtos.id"), nullable=False)
    localizacao_id: Mapped[int] = mapped_column(ForeignKey("localizacoes.id"), nullable=False)
    quantidade: Mapped[int] = mapped_column(Numeric, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("produto_id", "localizacao_id", name="uq_saldo_produto_localizacao"),
    )
