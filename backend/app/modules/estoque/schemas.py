from pydantic import BaseModel, ConfigDict


class DepositoCreate(BaseModel):
    nome: str


class DepositoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str


class LocalizacaoCreate(BaseModel):
    deposito_id: int
    codigo: str


class LocalizacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    deposito_id: int
    codigo: str


class SaldoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    produto_id: int
    localizacao_id: int
    deposito_id: int
    quantidade: int


class ResumoSaldoOut(BaseModel):
    produto_id: int
    quantidade_total: int
    estoque_minimo: int
    abaixo_minimo: bool
    saldos: list[SaldoOut]
