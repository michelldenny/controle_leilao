import React, { useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { calculateAgingBreakdown, calculateSellThroughRate } from "../services/financialMath";
import { formatCurrency } from "../lib/dateUtils";
import { Clock, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2, Award, Calendar, Tag } from "lucide-react";

export const AgingAndTurnoverView: React.FC = () => {
  const { items, sales } = useAuction();

  // Matriz de Aging por faixas de dias
  const aging = useMemo(() => {
    return calculateAgingBreakdown(items);
  }, [items]);

  // Sell-Through & Giro Estatístico
  const stats = useMemo(() => {
    const totalItems = items.length;
    const soldItems = items.filter((i) => i.isSold).length;
    const sellThroughRate = calculateSellThroughRate(totalItems, soldItems);

    const activeUnsold = items.filter((i) => !i.isSold && i.status !== "descartado" && i.status !== "uso_proprio");
    const avgDaysInStock =
      activeUnsold.length > 0
        ? Math.round(activeUnsold.reduce((acc, i) => acc + (i.daysInStock || 0), 0) / activeUnsold.length)
        : 0;

    const criticalItems = activeUnsold.filter((i) => (i.daysInStock || 0) > 90);

    return {
      totalItems,
      soldItems,
      activeCount: activeUnsold.length,
      sellThroughRate,
      avgDaysInStock,
      criticalCount: criticalItems.length,
      criticalCapital: criticalItems.reduce((acc, i) => acc + (i.realTotalCost || 0), 0),
    };
  }, [items]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Análise de Aging & Giro de Estoque</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maturidade dos bens no inventário, sell-through rate, faixas temporais e controle de risco de imobilização de capital.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Tempo Médio em Carteira</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
            <span>{stats.avgDaysInStock}</span>
            <span className="text-sm font-semibold text-slate-500">dias</span>
          </div>
          <p className="text-slate-500">Média de retenção dos itens ativos</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Taxa de Sell-Through</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
            <span>{stats.sellThroughRate}%</span>
          </div>
          <p className="text-slate-500">{stats.soldItems} de {stats.totalItems} bens comercializados</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Bens em Risco (&gt;90 dias)</span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.criticalCount}
          </div>
          <p className="text-slate-500">Itens com giro lento ou retenção alta</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Capital Imobilizado Risco</span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(stats.criticalCapital)}
          </div>
          <p className="text-slate-500">Custo acumulado em bens &gt;90 dias</p>
        </div>
      </div>

      {/* Faixas de Aging Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Matriz de Faixas Temporais (Aging List)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* 0-30 dias */}
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <span>0 a 30 dias</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px]">Recente</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {aging.range0To30.count} itens
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Custo:</span>
                <span className="font-bold">{formatCurrency(aging.range0To30.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(aging.range0To30.est)}</span>
              </div>
            </div>
          </div>

          {/* 31-60 dias */}
          <div className="p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 space-y-3">
            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-bold">
              <span>31 a 60 dias</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[10px]">Ideal</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {aging.range31To60.count} itens
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Custo:</span>
                <span className="font-bold">{formatCurrency(aging.range31To60.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <span className="font-bold text-blue-600">{formatCurrency(aging.range31To60.est)}</span>
              </div>
            </div>
          </div>

          {/* 61-90 dias */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
              <span>61 a 90 dias</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px]">Atenção</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {aging.range61To90.count} itens
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Custo:</span>
                <span className="font-bold">{formatCurrency(aging.range61To90.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <span className="font-bold text-amber-600">{formatCurrency(aging.range61To90.est)}</span>
              </div>
            </div>
          </div>

          {/* 91-180 dias */}
          <div className="p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 space-y-3">
            <div className="flex justify-between items-center text-orange-600 dark:text-orange-400 font-bold">
              <span>91 a 180 dias</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-[10px]">Lento</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {aging.range91To180.count} itens
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Custo:</span>
                <span className="font-bold">{formatCurrency(aging.range91To180.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <span className="font-bold text-orange-600">{formatCurrency(aging.range91To180.est)}</span>
              </div>
            </div>
          </div>

          {/* >180 dias */}
          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-3">
            <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
              <span>&gt; 180 dias</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px]">Crítico</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {aging.rangeOver180.count} itens
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Custo:</span>
                <span className="font-bold">{formatCurrency(aging.rangeOver180.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <span className="font-bold text-rose-600">{formatCurrency(aging.rangeOver180.est)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
