import { api } from "./client";
import type { Usuario } from "../types";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function login(email: string, senha: string): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/login", { email, senha });
}

export function me(): Promise<Usuario> {
  return api.get<Usuario>("/usuarios/me");
}
