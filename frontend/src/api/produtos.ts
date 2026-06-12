import { api } from "./client";
import type { Produto, ProdutoCreate, ResumoSaldoOut } from "../types";

export function listarProdutos(apenasAtivos = false): Promise<Produto[]> {
  const query = apenasAtivos ? "?apenas_ativos=true" : "";
  return api.get<Produto[]>(`/produtos${query}`);
}

export function criarProduto(dados: ProdutoCreate): Promise<Produto> {
  return api.post<Produto>("/produtos", dados);
}

export function obterProduto(id: number): Promise<Produto> {
  return api.get<Produto>(`/produtos/${id}`);
}

export function consultarSaldo(produtoId: number): Promise<ResumoSaldoOut> {
  return api.get<ResumoSaldoOut>(`/produtos/${produtoId}/saldo`);
}
