import { api } from "./client";
import type { Deposito, Localizacao } from "../types";

export function listarDepositos(): Promise<Deposito[]> {
  return api.get<Deposito[]>("/depositos");
}

export function criarDeposito(nome: string): Promise<Deposito> {
  return api.post<Deposito>("/depositos", { nome });
}

export function listarLocalizacoes(depositoId?: number): Promise<Localizacao[]> {
  const query = depositoId !== undefined ? `?deposito_id=${depositoId}` : "";
  return api.get<Localizacao[]>(`/localizacoes${query}`);
}

export function criarLocalizacao(depositoId: number, codigo: string): Promise<Localizacao> {
  return api.post<Localizacao>("/localizacoes", { deposito_id: depositoId, codigo });
}
