from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.movimentacoes.models import TipoMovimentacao


class MovimentacaoCreate(BaseModel):
    produto_id: int
    localizacao_id: int
    quantidade: int = Field(gt=0)
    motivo: str = Field(min_length=1)


class MovimentacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: TipoMovimentacao
    produto_id: int
    localizacao_id: int
    usuario_id: int
    quantidade: int
    motivo: str
    criado_em: datetime
