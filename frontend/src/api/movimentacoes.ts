import { api } from "./client";
import type { Movimentacao, MovimentacaoCreate } from "../types";

export function registrarEntrada(dados: MovimentacaoCreate): Promise<Movimentacao> {
  return api.post<Movimentacao>("/movimentacoes/entradas", dados);
}

export function registrarSaida(dados: MovimentacaoCreate): Promise<Movimentacao> {
  return api.post<Movimentacao>("/movimentacoes/saidas", dados);
}

export function listarMovimentacoesPorProduto(produtoId: number): Promise<Movimentacao[]> {
  return api.get<Movimentacao[]>(`/movimentacoes/produtos/${produtoId}`);
}
