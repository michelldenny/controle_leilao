import React from "react";
import { useAuction } from "../context/AuctionContext";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Clock, Award, ShieldAlert } from "lucide-react";

export const BusinessIntelligenceView: React.FC = () => {
  const { metrics, items, auctions } = useAuction();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // Group profit by category
  const categoryStats: { [cat: string]: { cost: number; est: number; count: number } } = {};
  items.forEach((it) => {
    if (!categoryStats[it.category]) {
      categoryStats[it.category] = { cost: 0, est: 0, count: 0 };
    }
    categoryStats[it.category].cost += it.realTotalCost;
    categoryStats[it.category].est += it.estimatedMarketAvg;
    categoryStats[it.category].count += 1;
  });

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

      {/* Capital Immobilized Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Capital Imobilizado em Estoque</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(metrics.capitalInInventoryCost)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Representa o total investido em bens arrematados que ainda estão no estoque aguardando comercialização.
          </p>
          <div className="pt-2 border-t border-amber-500/20 text-xs flex justify-between font-bold">
            <span className="text-slate-500">Valuation de Venda do Estoque:</span>
            <span className="text-emerald-600">{formatCurrency(metrics.capitalInInventoryEstimated)}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Tempo Médio de Giro do Estoque</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            34 Dias
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Média de dias entre a arrematação/entrada do bem no sistema até a venda final concluída.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between font-bold">
            <span className="text-slate-500">Giro Rápido (&lt; 15 dias):</span>
            <span className="text-emerald-600">45% do estoque</span>
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
                <th className="p-3">Categoria</th>
                <th className="p-3 text-center">Itens Em Carteira</th>
                <th className="p-3 text-right">Custo Total (R$)</th>
                <th className="p-3 text-right">Valuation Estimado (R$)</th>
                <th className="p-3 text-right">Margem Bruta Estimada %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(categoryStats).map((cat) => {
                const stat = categoryStats[cat];
                const profitEst = stat.est - stat.cost;
                const marginPct = stat.cost > 0 ? (profitEst / stat.cost) * 100 : 0;

                return (
                  <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{cat}</td>
                    <td className="p-3 text-center font-medium text-slate-600">{stat.count}</td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(stat.cost)}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(stat.est)}</td>
                    <td className="p-3 text-right font-extrabold text-amber-600 dark:text-amber-400">{marginPct.toFixed(1)}%</td>
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
