import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Clock, Award, ShieldAlert, ArrowUpDown, ArrowUp, ArrowDown, Home } from "lucide-react";

type SortField = "category" | "count" | "cost" | "est" | "margin";
type SortDirection = "asc" | "desc";

export const BusinessIntelligenceView: React.FC = () => {
  const { metrics, items, sales, auctions } = useAuction();

  const [sortField, setSortField] = useState<SortField>("category");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // Dynamic stock turnover calculations
  const turnoverStats = React.useMemo(() => {
    const soldSales = sales.filter((s) => s.saleDate);
    if (soldSales.length === 0) {
      return { avgDays: 0, fastTurnoverPct: 0 };
    }

    let totalDays = 0;
    let fastCount = 0;
    let countedSales = 0;

    soldSales.forEach((sale) => {
      const item = items.find((i) => i.id === sale.itemId);
      if (item && item.dateAdded && sale.saleDate) {
        const startDate = new Date(item.dateAdded).getTime();
        const endDate = new Date(sale.saleDate).getTime();
        const diffDays = Math.max(0, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));
        totalDays += diffDays;
        if (diffDays <= 15) fastCount++;
        countedSales++;
      }
    });

    const avgDays = countedSales > 0 ? Math.round(totalDays / countedSales) : 0;
    const fastTurnoverPct = countedSales > 0 ? Math.round((fastCount / countedSales) * 100) : 0;

    return { avgDays, fastTurnoverPct };
  }, [items, sales]);

  // Group profit by category
  const sortedCategories = React.useMemo(() => {
    const categoryStats: { [cat: string]: { cat: string; cost: number; est: number; count: number; roi: number; netMargin: number } } = {};
    items.forEach((it) => {
      if (!categoryStats[it.category]) {
        categoryStats[it.category] = { cat: it.category, cost: 0, est: 0, count: 0, roi: 0, netMargin: 0 };
      }
      categoryStats[it.category].cost += it.realTotalCost;
      categoryStats[it.category].est += it.estimatedMarketAvg;
      categoryStats[it.category].count += 1;
    });

    const list = Object.values(categoryStats).map((st) => {
      const profitEst = st.est - st.cost;
      const roi = st.cost > 0 ? (profitEst / st.cost) * 100 : 0;
      const netMargin = st.est > 0 ? (profitEst / st.est) * 100 : 0;
      return { ...st, margin: roi, roi, netMargin };
    });

    list.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [items, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-amber-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-500" />
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <span>Inteligência do Negócio (BI) & Análise de Capital</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Indicadores estratégicos, capital imobilizado e análise de liquidez do portfólio de leilões
          </p>
        </div>
      </div>

      {/* Capital & Patrimony Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Capital Imobilizado à Venda</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(metrics.capitalInInventoryCost)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Investimento em bens no estoque aguardando comercialização.
          </p>
          <div className="pt-2 border-t border-amber-500/20 text-xs flex justify-between font-bold">
            <span className="text-slate-500">Valuation de Venda:</span>
            <span className="text-emerald-600">{formatCurrency(metrics.capitalInInventoryEstimated)}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 space-y-3">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>Patrimônio Retido (Uso Próprio)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(metrics.ownUseEstimatedTotal)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Valor estimado dos {metrics.ownUseItemsCount} bens retidos para uso próprio.
          </p>
          <div className="pt-2 border-t border-teal-500/20 text-xs flex justify-between font-bold">
            <span className="text-slate-500">Economia Gerada (vs Mercado):</span>
            <span className="text-teal-600">{formatCurrency(metrics.ownUseSavingsTotal)}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Giro Médio do Estoque</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {turnoverStats.avgDays} Dias
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tempo médio da arrematação até a venda concluída.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between font-bold">
            <span className="text-slate-500">Giro Rápido (&lt; 15 dias):</span>
            <span className="text-emerald-600">{turnoverStats.fastTurnoverPct}% das vendas</span>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Performance por Categoria de Produto</h3>

        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white font-bold transition-colors group cursor-pointer"
                  >
                    <span>Categoria</span>
                    {renderSortIcon("category")}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("count")}
                    className="flex items-center justify-center gap-1.5 hover:text-slate-900 dark:hover:text-white font-bold transition-colors group cursor-pointer w-full"
                  >
                    <span>Itens Em Carteira</span>
                    {renderSortIcon("count")}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("cost")}
                    className="flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white font-bold transition-colors group cursor-pointer w-full"
                  >
                    <span>Custo Total (R$)</span>
                    {renderSortIcon("cost")}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("est")}
                    className="flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white font-bold transition-colors group cursor-pointer w-full"
                  >
                    <span>Valuation Estimado (R$)</span>
                    {renderSortIcon("est")}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("margin")}
                    className="flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white font-bold transition-colors group cursor-pointer w-full"
                    title="Fórmula: (Valuation Estimado - Custo Total) / Custo Total * 100"
                  >
                    <span>ROI / Markup Estimado %</span>
                    {renderSortIcon("margin")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCategories.map((stat) => {
                return (
                  <tr key={stat.cat} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{stat.cat}</td>
                    <td className="p-3 text-center font-medium text-slate-600">{stat.count}</td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(stat.cost)}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(stat.est)}</td>
                    <td className="p-3 text-right font-extrabold text-amber-600 dark:text-amber-400">
                      {stat.roi > 0 ? `+${stat.roi.toFixed(1)}%` : `${stat.roi.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
