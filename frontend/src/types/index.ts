export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  unidade_medida: string;
  estoque_minimo: number;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_serie: boolean;
  ativo: boolean;
}

export interface ProdutoCreate {
  codigo: string;
  nome: string;
  unidade_medida: string;
  estoque_minimo: number;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_serie: boolean;
}

export interface Deposito {
  id: number;
  nome: string;
}

export interface Localizacao {
  id: number;
  deposito_id: number;
  codigo: string;
}

export interface SaldoOut {
  produto_id: number;
  localizacao_id: number;
  deposito_id: number;
  quantidade: number;
}

export interface ResumoSaldoOut {
  produto_id: number;
  quantidade_total: number;
  estoque_minimo: number;
  abaixo_minimo: boolean;
  saldos: SaldoOut[];
}

export type TipoMovimentacao = "ENTRADA" | "SAIDA";

export interface Movimentacao {
  id: number;
  tipo: TipoMovimentacao;
  produto_id: number;
  localizacao_id: number;
  usuario_id: number;
  quantidade: number;
  motivo: string;
  criado_em: string;
}

export interface MovimentacaoCreate {
  produto_id: number;
  localizacao_id: number;
  quantidade: number;
  motivo: string;
}
