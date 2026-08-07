import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { formatCurrency } from "../lib/dateUtils";
import { DollarSign, ArrowDownCircle, ArrowUpCircle, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";

export const FinancialAccountsView: React.FC = () => {
  const { lots, sales, expenses } = useAuction();
  const [activeTab, setActiveTab] = useState<"payables" | "receivables">("payables");

  // Contas a Pagar (Lotes arrematados e despesas adicionais pendentes)
  const payables = useMemo(() => {
    const list: any[] = [];

    lots.forEach((lot) => {
      list.push({
        id: `pay-lot-${lot.id}`,
        title: `Lote Arrematado #${lot.lotNumber}`,
        entity: `Leilão #${lot.auctionId}`,
        dueDate: lot.paymentDeadline,
        amount: lot.totalLotCost,
        status: lot.paymentStatus,
        type: "Lote de Leilão",
      });
    });

    expenses.forEach((exp) => {
      list.push({
        id: `pay-exp-${exp.id}`,
        title: `Despesa: ${exp.description}`,
        entity: exp.supplier || "Fornecedor",
        dueDate: exp.date,
        amount: exp.amount,
        status: "pago",
        type: exp.category,
      });
    });

    return list;
  }, [lots, expenses]);

  // Contas a Receber (Vendas efetuadas)
  const receivables = useMemo(() => {
    return sales.map((sale) => ({
      id: `rec-sale-${sale.id}`,
      title: `Venda: ${sale.buyerName}`,
      entity: sale.platform,
      dueDate: sale.saleDate,
      amount: sale.finalPrice,
      netAmount: sale.netSaleValue,
      status: sale.paymentStatus || "pago",
      type: sale.paymentMethod || "Pix",
    }));
  }, [sales]);

  const totalPayables = useMemo(() => payables.reduce((acc, curr) => acc + curr.amount, 0), [payables]);
  const totalReceivables = useMemo(() => receivables.reduce((acc, curr) => acc + curr.amount, 0), [receivables]);
  const pendingReceivables = useMemo(
    () => receivables.filter((r) => r.status === "pendente").reduce((acc, curr) => acc + curr.amount, 0),
    [receivables]
  );
  const pendingPayables = useMemo(
    () => payables.filter((p) => p.status === "pendente" || p.status === "atrasado").reduce((acc, curr) => acc + curr.amount, 0),
    [payables]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-500" />
            <span>Gestão de Contas a Pagar & Receber</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle de obrigações de arrematação, despesas operacionais, fluxo de recebíveis e inadimplência.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px]">
            <ArrowDownCircle className="w-4 h-4" />
            <span>Total Contas a Pagar</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalPayables)}
          </div>
          <p className="text-slate-500">Total acumulado de obrigações</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-4 h-4" />
            <span>Pendente a Pagar</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatCurrency(pendingPayables)}
          </div>
          <p className="text-slate-500">Lotes ou despesas pendentes de liquidação</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Total Contas a Receber</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalReceivables)}
          </div>
          <p className="text-slate-500">Total bruto gerado em vendas</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider text-[11px]">
            <Clock className="w-4 h-4" />
            <span>A Receber Pendente</span>
          </div>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {formatCurrency(pendingReceivables)}
          </div>
          <p className="text-slate-500">Vendas a prazo ou pendentes de confirmação</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab("payables")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === "payables"
              ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Contas a Pagar ({payables.length})
        </button>

        <button
          onClick={() => setActiveTab("receivables")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === "receivables"
              ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Contas a Receber ({receivables.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">Título / Referência</th>
              <th className="p-4">Entidade / Fornecedor / Canal</th>
              <th className="p-4">Vencimento / Data</th>
              <th className="p-4">Categoria / Tipo</th>
              <th className="p-4 text-right">Valor (R$)</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {(activeTab === "payables" ? payables : receivables).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  Nenhum registro financeiro nesta categoria.
                </td>
              </tr>
            ) : (
              (activeTab === "payables" ? payables : receivables).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{row.title}</td>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{row.entity}</td>
                  <td className="p-4 text-slate-500">{row.dueDate || "-"}</td>
                  <td className="p-4 font-semibold text-slate-500">{row.type}</td>
                  <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    {row.status === "pago" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Liquidado / Pago
                      </span>
                    ) : row.status === "atrasado" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Atrasado / Inadimplente
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
