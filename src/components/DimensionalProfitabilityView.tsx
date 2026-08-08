import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { formatCurrency } from "../lib/dateUtils";
import { TrendingUp, PieChart, BarChart3, Layers, ShoppingBag, Award, Tag } from "lucide-react";

export const DimensionalProfitabilityView: React.FC = () => {
  const { items, sales, auctions, lots } = useAuction();
  const [dimension, setDimension] = useState<"auction" | "category" | "platform">("auction");

  // Matriz multidimensional de rentabilidade
  const breakdown = useMemo(() => {
    if (dimension === "auction") {
      const stats: { [key: string]: { name: string; cost: number; est: number; sales: number; netProfit: number } } = {};

      auctions.forEach((auc) => {
        stats[auc.id] = { name: auc.name, cost: 0, est: 0, sales: 0, netProfit: 0 };
      });

      items.forEach((item) => {
        if (stats[item.auctionId]) {
          stats[item.auctionId].cost += item.realTotalCost || 0;
          stats[item.auctionId].est += item.estimatedMarketAvg || 0;
        }
      });

      sales.forEach((sale) => {
        const item = items.find((i) => i.id === sale.itemId);
        if (item && stats[item.auctionId]) {
          stats[item.auctionId].sales += sale.netSaleValue || 0;
          stats[item.auctionId].netProfit += sale.netProfit || 0;
        }
      });

      return Object.values(stats);
    } else if (dimension === "category") {
      const stats: { [key: string]: { name: string; cost: number; est: number; sales: number; netProfit: number } } = {};

      items.forEach((item) => {
        const cat = item.category || "Sem Categoria";
        if (!stats[cat]) {
          stats[cat] = { name: cat, cost: 0, est: 0, sales: 0, netProfit: 0 };
        }
        stats[cat].cost += item.realTotalCost || 0;
        stats[cat].est += item.estimatedMarketAvg || 0;
      });

      sales.forEach((sale) => {
        const item = items.find((i) => i.id === sale.itemId);
        if (item) {
          const cat = item.category || "Sem Categoria";
          if (stats[cat]) {
            stats[cat].sales += sale.netSaleValue || 0;
            stats[cat].netProfit += sale.netProfit || 0;
          }
        }
      });

      return Object.values(stats);
    } else {
      const stats: { [key: string]: { name: string; cost: number; est: number; sales: number; netProfit: number } } = {};

      sales.forEach((sale) => {
        const platform = sale.platform || "Venda Direta";
        if (!stats[platform]) {
          stats[platform] = { name: platform, cost: 0, est: 0, sales: 0, netProfit: 0 };
        }
        stats[platform].sales += sale.netSaleValue || 0;
        stats[platform].cost += sale.costBasisAtSale || 0;
        stats[platform].netProfit += sale.netProfit || 0;
      });

      return Object.values(stats);
    }
  }, [dimension, items, sales, auctions]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-amber-500" />
            <span>Rentabilidade Dimensional (Estimado vs Realizado)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Análise comparativa de performance e ROI agrupada por leilão, categoria de produto e canal de comercialização.
          </p>
        </div>

        {/* Dimension Select */}
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setDimension("auction")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              dimension === "auction" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Por Leilão
          </button>
          <button
            onClick={() => setDimension("category")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              dimension === "category" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Por Categoria
          </button>
          <button
            onClick={() => setDimension("platform")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              dimension === "platform" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Por Canal de Venda
          </button>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">Dimensão / Nome</th>
              <th className="p-4 text-right">Custo Total (R$)</th>
              <th className="p-4 text-right">Valuation Estimado (R$)</th>
              <th className="p-4 text-right">Receita Líquida Realizada (R$)</th>
              <th className="p-4 text-right">Lucro Realizado (R$)</th>
              <th className="p-4 text-right">ROI Realizado %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {breakdown.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  Nenhum dado registrado para esta dimensão.
                </td>
              </tr>
            ) : (
              breakdown.map((row, idx) => {
                const roiRealized = row.cost > 0 ? (row.netProfit / row.cost) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(row.cost)}
                    </td>
                    <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(row.est)}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.sales)}
                    </td>
                    <td className="p-4 text-right font-extrabold">
                      <span className={row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {formatCurrency(row.netProfit)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
                      {roiRealized > 0 ? `+${roiRealized.toFixed(1)}%` : `${roiRealized.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
