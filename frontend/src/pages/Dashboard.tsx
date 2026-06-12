import { useEffect, useState } from "react";
import * as produtosApi from "../api/produtos";
import * as movimentacoesApi from "../api/movimentacoes";
import type { Movimentacao, Produto, ResumoSaldoOut } from "../types";

interface MovimentacaoComProduto extends Movimentacao {
  produtoNome: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [saldos, setSaldos] = useState<Record<number, ResumoSaldoOut>>({});
  const [recentes, setRecentes] = useState<MovimentacaoComProduto[]>([]);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prods = await produtosApi.listarProdutos(true);
        setProdutos(prods);

        const saldoMap: Record<number, ResumoSaldoOut> = {};
        const allMovs: MovimentacaoComProduto[] = [];
        let entradasSum = 0;
        let saidasSum = 0;

        await Promise.all(
          prods.map(async (p) => {
            const [saldo, movs] = await Promise.all([
              produtosApi.consultarSaldo(p.id),
              movimentacoesApi.listarMovimentacoesPorProduto(p.id),
            ]);
            saldoMap[p.id] = saldo;
            for (const m of movs) {
              if (m.tipo === "ENTRADA") entradasSum += m.quantidade;
              else saidasSum += m.quantidade;
              allMovs.push({ ...m, produtoNome: p.nome });
            }
          })
        );

        setSaldos(saldoMap);
        setTotalEntradas(entradasSum);
        setTotalSaidas(saidasSum);
        setRecentes(allMovs.sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const produtosAbaixoMinimo = produtos.filter((p) => saldos[p.id]?.abaixo_minimo);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Visão geral do estoque</p>
      </div>

      {!loading && produtosAbaixoMinimo.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-orange-800 font-semibold text-sm">Atenção: produtos com estoque abaixo do mínimo</p>
            <p className="text-orange-700 text-sm mt-0.5">
              {produtosAbaixoMinimo.map((p) => `${p.nome} (${p.codigo})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Total de Produtos</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EBF0FF" }}>
              <svg className="w-5 h-5" style={{ color: "#1E3A5F" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{produtos.length}</p>
          <p className="text-gray-400 text-xs mt-1">cadastrados no sistema</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Estoque Baixo</p>
            {produtosAbaixoMinimo.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Crítico</span>
            )}
          </div>
          <p className={`text-3xl font-bold ${produtosAbaixoMinimo.length > 0 ? "text-red-600" : "text-gray-800"}`}>
            {produtosAbaixoMinimo.length}
          </p>
          <p className="text-gray-400 text-xs mt-1">produtos abaixo do mínimo</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Total de Entradas</p>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalEntradas}</p>
          <p className="text-gray-400 text-xs mt-1">unidades recebidas</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Total de Saídas</p>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalSaidas}</p>
          <p className="text-gray-400 text-xs mt-1">unidades expedidas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-700 font-semibold mb-4">Últimas Movimentações</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : recentes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="space-y-3">
            {recentes.map((m, i) => (
              <div key={m.id} className={`flex items-center justify-between text-sm ${i > 0 ? "border-t pt-3" : ""}`}>
                <div>
                  <p className="font-medium text-gray-700">{m.produtoNome}</p>
                  <p className="text-gray-400 text-xs">{formatDate(m.criado_em)}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    m.tipo === "ENTRADA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {m.tipo === "ENTRADA" ? "+" : "-"}
                  {m.quantidade} {m.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
