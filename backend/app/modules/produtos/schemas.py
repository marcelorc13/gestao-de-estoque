from pydantic import BaseModel, ConfigDict, Field


class ProdutoCreate(BaseModel):
    codigo: str
    nome: str
    unidade_medida: str
    estoque_minimo: int = Field(ge=0, default=0)
    controla_lote: bool = False
    controla_validade: bool = False
    controla_serie: bool = False


class ProdutoUpdate(BaseModel):
    nome: str | None = None
    unidade_medida: str | None = None
    estoque_minimo: int | None = Field(ge=0, default=None)
    controla_lote: bool | None = None
    controla_validade: bool | None = None
    controla_serie: bool | None = None
    ativo: bool | None = None


class ProdutoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nome: str
    unidade_medida: str
    estoque_minimo: int
    controla_lote: bool
    controla_validade: bool
    controla_serie: bool
    ativo: bool
