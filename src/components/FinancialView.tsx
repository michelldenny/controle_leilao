import React from "react";
import { useAuction } from "../context/AuctionContext";
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, FileSpreadsheet } from "lucide-react";

export const FinancialView: React.FC = () => {
  const { metrics, items } = useAuction();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const soldItems = items.filter((i) => i.status === "vendido" && i.saleDetails);
  const totalInflows = soldItems.reduce((acc, curr) => acc + (curr.saleDetails?.finalPrice || 0), 0);
  const totalOutflows = metrics.totalInvested;
  const netCashflow = totalInflows - totalOutflows;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-500" />
            <span>Módulo Financeiro & Fluxo de Caixa</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Entradas (receita de vendas) vs Saídas (investimento em leilões e manutenção)
          </p>
        </div>
      </div>

      {/* Cashflow Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Saídas (Investimentos)</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalOutflows)}
          </div>
          <p className="text-[11px] text-slate-400">Arrematações + reformas + logística</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Entradas (Receita Vendas)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalInflows)}
          </div>
          <p className="text-[11px] text-slate-400">Recebido de compradores</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Resultado Acumulado</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-extrabold ${netCashflow >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatCurrency(netCashflow)}
          </div>
          <p className="text-[11px] text-slate-400">Balanço do caixa atual</p>
        </div>
      </div>

      {/* Financial Statement Table (DRE Sintentico) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Demonstrativo do Resultado do Exercício (DRE Simplificado)</h3>
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr className="bg-slate-50 dark:bg-slate-800/80">
                <td className="p-3 font-bold text-slate-900 dark:text-white">(=) Receita Bruta de Vendas de Leilão</td>
                <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(totalInflows)}</td>
              </tr>
              <tr>
                <td className="p-3 pl-6 text-slate-500">(-) Deduções de Venda (Comissões de Plataforma & Frete)</td>
                <td className="p-3 text-right text-red-500">
                  {formatCurrency(soldItems.reduce((acc, curr) => acc + (curr.saleDetails?.platformCommission || 0) + (curr.saleDetails?.sellerFreight || 0), 0))}
                </td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800/80">
                <td className="p-3 font-bold text-slate-900 dark:text-white">(=) Receita Líquida de Vendas</td>
                <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(soldItems.reduce((acc, curr) => acc + (curr.saleDetails?.netSaleValue || 0), 0))}
                </td>
              </tr>
              <tr>
                <td className="p-3 pl-6 text-slate-500">(-) Custo dos Bens Vendidos (CPV do Leilão)</td>
                <td className="p-3 text-right text-red-500">
                  {formatCurrency(soldItems.reduce((acc, curr) => acc + curr.realTotalCost, 0))}
                </td>
              </tr>
              <tr className="bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                <td className="p-3">(=) LUCRO LÍQUIDO REALIZADO</td>
                <td className="p-3 text-right text-sm">{formatCurrency(metrics.realizedProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
