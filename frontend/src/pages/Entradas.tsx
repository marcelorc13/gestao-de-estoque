import { useEffect, useState, type FormEvent } from "react";
import * as produtosApi from "../api/produtos";
import * as estoqueApi from "../api/estoque";
import * as movimentacoesApi from "../api/movimentacoes";
import { ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Localizacao, Movimentacao, Produto } from "../types";

interface HistoricoItem extends Movimentacao {
  produtoNome: string;
  produtoCodigo: string;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR");
}

export function Entradas() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const [prods, locs] = await Promise.all([
        produtosApi.listarProdutos(true),
        estoqueApi.listarLocalizacoes(),
      ]);
      setProdutos(prods);
      setLocalizacoes(locs);

      const movs = await Promise.all(
        prods.map(async (p) => {
          const lista = await movimentacoesApi.listarMovimentacoesPorProduto(p.id);
          return lista
            .filter((m) => m.tipo === "ENTRADA")
            .map((m) => ({ ...m, produtoNome: p.nome, produtoCodigo: p.codigo }));
        })
      );
      const flat = movs.flat().sort((a, b) => b.criado_em.localeCompare(a.criado_em));
      setHistorico(flat);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!produtoId) next.produto = "Selecione um produto";
    if (!localizacaoId) next.localizacao = "Selecione uma localização";
    const qtd = Number(quantidade);
    if (!quantidade || Number.isNaN(qtd) || qtd <= 0) next.quantidade = "Informe uma quantidade válida";
    if (!motivo.trim()) next.motivo = "Campo obrigatório";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await movimentacoesApi.registrarEntrada({
        produto_id: Number(produtoId),
        localizacao_id: Number(localizacaoId),
        quantidade: Number(quantidade),
        motivo: motivo.trim(),
      });
      const produto = produtos.find((p) => p.id === Number(produtoId));
      showToast(`Entrada de ${quantidade} unidade(s) de "${produto?.nome}" registrada com sucesso!`, "success");
      setQuantidade("");
      setMotivo("");
      setErrors({});
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao registrar entrada.", "error");
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registrar Entrada</h2>
        <p className="text-gray-500 text-sm mt-1">Registre a entrada de produtos no estoque</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="text-gray-700 font-semibold mb-5">Nova Entrada</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto <span className="text-red-500">*</span>
              </label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                  errors.produto ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} — {p.nome}
                  </option>
                ))}
              </select>
              {errors.produto && <p className="text-red-500 text-xs mt-1">{errors.produto}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização <span className="text-red-500">*</span>
              </label>
              <select
                value={localizacaoId}
                onChange={(e) => setLocalizacaoId(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                  errors.localizacao ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecione uma localização...</option>
                {localizacoes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.codigo}
                  </option>
                ))}
              </select>
              {errors.localizacao && <p className="text-red-500 text-xs mt-1">{errors.localizacao}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantidade ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.quantidade && <p className="text-red-500 text-xs mt-1">{errors.quantidade}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo / Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: NF 12345 - Fornecedor ABC"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.motivo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
            style={{ backgroundColor: "#27AE60" }}
          >
            Registrar Entrada
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Histórico de Entradas</h3>
          <span className="text-sm text-gray-500">
            {historico.length} registro{historico.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Produto</th>
                <th className="pb-3 font-medium text-center">Quantidade</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : historico.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    Nenhuma entrada registrada.
                  </td>
                </tr>
              ) : (
                historico.map((h, i) => (
                  <tr key={h.id} className={(i % 2 === 0 ? "bg-white" : "bg-gray-50") + " hover:bg-blue-50 transition-colors"}>
                    <td className="py-3 px-2 font-mono text-gray-500 text-xs">{h.produtoCodigo}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">{h.produtoNome}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">+{h.quantidade}</span>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{formatDate(h.criado_em)}</td>
                    <td className="py-3 px-2 text-gray-500">{h.motivo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
