import { useEffect, useState, type FormEvent } from "react";
import * as produtosApi from "../api/produtos";
import { ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Produto, ResumoSaldoOut } from "../types";

interface FormState {
  codigo: string;
  nome: string;
  unidade_medida: string;
  estoque_minimo: string;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_serie: boolean;
}

const initialForm: FormState = {
  codigo: "",
  nome: "",
  unidade_medida: "",
  estoque_minimo: "0",
  controla_lote: false,
  controla_validade: false,
  controla_serie: false,
};

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [saldos, setSaldos] = useState<Record<number, ResumoSaldoOut>>({});
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function loadProdutos() {
    setLoading(true);
    try {
      const data = await produtosApi.listarProdutos();
      setProdutos(data);

      const saldoEntries = await Promise.all(
        data.map(async (p) => {
          try {
            return [p.id, await produtosApi.consultarSaldo(p.id)] as const;
          } catch {
            return null;
          }
        })
      );
      const saldoMap: Record<number, ResumoSaldoOut> = {};
      for (const entry of saldoEntries) {
        if (entry) saldoMap[entry[0]] = entry[1];
      }
      setSaldos(saldoMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProdutos();
  }, []);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.codigo.trim()) next.codigo = "Campo obrigatório";
    if (!form.nome.trim()) next.nome = "Campo obrigatório";
    if (!form.unidade_medida.trim()) next.unidade_medida = "Campo obrigatório";
    const min = Number(form.estoque_minimo);
    if (Number.isNaN(min) || min < 0) next.estoque_minimo = "Informe um valor válido";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await produtosApi.criarProduto({
        codigo: form.codigo.trim().toUpperCase(),
        nome: form.nome.trim(),
        unidade_medida: form.unidade_medida.trim(),
        estoque_minimo: Number(form.estoque_minimo),
        controla_lote: form.controla_lote,
        controla_validade: form.controla_validade,
        controla_serie: form.controla_serie,
      });
      showToast(`Produto "${form.nome}" cadastrado com sucesso!`, "success");
      setForm(initialForm);
      setErrors({});
      await loadProdutos();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ codigo: "Código já cadastrado" });
      } else {
        showToast("Erro ao cadastrar produto.", "error");
      }
    }
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
        <p className="text-gray-500 text-sm mt-1">Cadastre e visualize todos os produtos do estoque</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="text-gray-700 font-semibold mb-5">Cadastrar Novo Produto</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
                placeholder="Ex: Notebook Dell"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setField("codigo", e.target.value)}
                placeholder="Ex: SKU009"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.codigo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Medida <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.unidade_medida}
                onChange={(e) => setField("unidade_medida", e.target.value)}
                placeholder="Ex: UN, CX, KG"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.unidade_medida ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.unidade_medida && <p className="text-red-500 text-xs mt-1">{errors.unidade_medida}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.estoque_minimo}
                onChange={(e) => setField("estoque_minimo", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estoque_minimo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.estoque_minimo && <p className="text-red-500 text-xs mt-1">{errors.estoque_minimo}</p>}
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="controla_lote"
                type="checkbox"
                checked={form.controla_lote}
                onChange={(e) => setField("controla_lote", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="controla_lote" className="text-sm text-gray-700">Controla lote</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="controla_validade"
                type="checkbox"
                checked={form.controla_validade}
                onChange={(e) => setField("controla_validade", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="controla_validade" className="text-sm text-gray-700">Controla validade</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="controla_serie"
                type="checkbox"
                checked={form.controla_serie}
                onChange={(e) => setField("controla_serie", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="controla_serie" className="text-sm text-gray-700">Controla série</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              Salvar Produto
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Produtos Cadastrados</h3>
          <span className="text-sm text-gray-500">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Unidade</th>
                <th className="pb-3 font-medium text-center">Qtd. Total</th>
                <th className="pb-3 font-medium text-center">Estoque Mín.</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                produtos.map((p, i) => {
                  const saldo = saldos[p.id];
                  const abaixoMinimo = saldo?.abaixo_minimo ?? false;
                  return (
                    <tr key={p.id} className={(i % 2 === 0 ? "bg-white" : "bg-gray-50") + " hover:bg-blue-50 transition-colors"}>
                      <td className="py-3 px-2 font-mono text-gray-600">{p.codigo}</td>
                      <td className="py-3 px-2 font-medium text-gray-800">{p.nome}</td>
                      <td className="py-3 px-2 text-gray-600">{p.unidade_medida}</td>
                      <td className={`py-3 px-2 text-center font-semibold ${abaixoMinimo ? "text-red-600" : "text-gray-800"}`}>
                        {saldo?.quantidade_total ?? 0}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-500">{p.estoque_minimo}</td>
                      <td className="py-3 px-2 text-center">
                        {!p.ativo ? (
                          <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">Inativo</span>
                        ) : abaixoMinimo ? (
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Baixo</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
