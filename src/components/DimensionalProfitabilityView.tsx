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
      const stats: { [key: string]: { name: string; cost: number; est: number; grossSales: number; sales: number; netProfit: number } } = {};

      auctions.forEach((auc) => {
        const aucLots = lots.filter((l) => l.auctionId === auc.id);
        const totalLotsCost = aucLots.reduce((acc, l) => acc + (l.totalLotCost || 0), 0);

        const aucItems = items.filter((i) => i.auctionId === auc.id || aucLots.some((l) => l.id === i.lotId));
        const itemCostSum = aucItems.reduce((acc, i) => acc + (i.realTotalCost || 0), 0);

        const auctionTotalCost = totalLotsCost > 0 ? totalLotsCost : itemCostSum;
        const estValuation = aucItems.reduce((acc, i) => acc + (i.estimatedMarketAvg || 0), 0);

        stats[auc.id] = { name: auc.name, cost: auctionTotalCost, est: estValuation, grossSales: 0, sales: 0, netProfit: 0 };
      });

      sales.forEach((sale) => {
        const item = items.find((i) => i.id === sale.itemId);
        let aucId = item?.auctionId;
        if (!aucId && item?.lotId) {
          const parentLot = lots.find((l) => l.id === item.lotId);
          aucId = parentLot?.auctionId;
        }

        if (aucId && stats[aucId]) {
          stats[aucId].grossSales += sale.finalPrice || 0;
          stats[aucId].sales += sale.netSaleValue || 0;
          stats[aucId].netProfit += sale.netProfit || 0;
        }
      });

      return Object.values(stats);
    } else if (dimension === "category") {
      const stats: { [key: string]: { name: string; cost: number; est: number; grossSales: number; sales: number; netProfit: number } } = {};

      items.forEach((item) => {
        const cat = item.category || "Sem Categoria";
        if (!stats[cat]) {
          stats[cat] = { name: cat, cost: 0, est: 0, grossSales: 0, sales: 0, netProfit: 0 };
        }
        stats[cat].cost += item.realTotalCost || 0;
        stats[cat].est += item.estimatedMarketAvg || 0;
      });

      sales.forEach((sale) => {
        const item = items.find((i) => i.id === sale.itemId);
        if (item) {
          const cat = item.category || "Sem Categoria";
          if (stats[cat]) {
            stats[cat].grossSales += sale.finalPrice || 0;
            stats[cat].sales += sale.netSaleValue || 0;
            stats[cat].netProfit += sale.netProfit || 0;
          }
        }
      });

      return Object.values(stats);
    } else {
      const stats: { [key: string]: { name: string; cost: number; est: number; grossSales: number; sales: number; netProfit: number } } = {};

      sales.forEach((sale) => {
        const platform = sale.platform || "Venda Direta";
        if (!stats[platform]) {
          stats[platform] = { name: platform, cost: 0, est: 0, grossSales: 0, sales: 0, netProfit: 0 };
        }
        stats[platform].grossSales += sale.finalPrice || 0;
        stats[platform].sales += sale.netSaleValue || 0;
        stats[platform].cost += sale.costBasisAtSale || 0;
        stats[platform].netProfit += sale.netProfit || 0;
      });

      return Object.values(stats);
    }
  }, [dimension, items, sales, auctions, lots]);

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
              <th className="p-4 text-right">Receita Bruta (R$)</th>
              <th className="p-4 text-right">Receita Líquida (R$)</th>
              <th className="p-4 text-right">Lucro Realizado (R$)</th>
              <th className="p-4 text-right">ROI Realizado %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {breakdown.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
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
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(row.grossSales)}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.sales)}
                    </td>
                    <td className="p-4 text-right font-extrabold">
                      <span className={row.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
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
          {breakdown.length > 0 && (() => {
            const totCost = breakdown.reduce((a, r) => a + r.cost, 0);
            const totEst = breakdown.reduce((a, r) => a + r.est, 0);
            const totGross = breakdown.reduce((a, r) => a + r.grossSales, 0);
            const totNetSales = breakdown.reduce((a, r) => a + r.sales, 0);
            const totProfit = breakdown.reduce((a, r) => a + r.netProfit, 0);
            const overallRoi = totCost > 0 ? (totProfit / totCost) * 100 : 0;

            return (
              <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                <tr>
                  <td className="p-4 text-left">TOTAL GERAL</td>
                  <td className="p-4 text-right text-slate-700 dark:text-slate-300">{formatCurrency(totCost)}</td>
                  <td className="p-4 text-right text-blue-600 dark:text-blue-400">{formatCurrency(totEst)}</td>
                  <td className="p-4 text-right text-slate-900 dark:text-white">{formatCurrency(totGross)}</td>
                  <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(totNetSales)}</td>
                  <td className={`p-4 text-right ${totProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatCurrency(totProfit)}
                  </td>
                  <td className={`p-4 text-right ${overallRoi >= 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {overallRoi >= 0 ? "+" : ""}{overallRoi.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>
    </div>
  );
};
