import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { calculateGoalProgress } from "../services/financialMath";
import { formatCurrency } from "../lib/dateUtils";
import { Target, TrendingUp, Award, DollarSign, PieChart, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";

export const GoalsAndTargetsView: React.FC = () => {
  const { sales, metrics } = useAuction();

  // Metas Mensais Configuráveis (Exemplo: Mês Atual)
  const [targetRevenue, setTargetRevenue] = useState<number>(100000);
  const [targetProfit, setTargetProfit] = useState<number>(30000);
  const [targetMargin, setTargetMargin] = useState<number>(25);

  // Cálculos Realizados com proteções contra undefined/NaN
  const realizedRevenue = useMemo(() => metrics?.totalSoldAmount || 0, [metrics]);
  const realizedProfit = useMemo(() => metrics?.realizedProfit || 0, [metrics]);
  const realizedMargin = useMemo(() => metrics?.netMargin || 0, [metrics]);

  const revenueProgress = useMemo(() => calculateGoalProgress(realizedRevenue, targetRevenue || 0), [realizedRevenue, targetRevenue]);
  const profitProgress = useMemo(() => calculateGoalProgress(realizedProfit, targetProfit || 0), [realizedProfit, targetProfit]);
  const marginProgress = useMemo(() => (targetMargin > 0 ? (realizedMargin / targetMargin) * 100 : 0), [realizedMargin, targetMargin]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            <span>Metas Mensais & Indicadores (Realizado vs Meta)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Planejamento estratégico de vendas, margem de lucro, teto de estoque e acompanhamento do progresso orçamentário.
          </p>
        </div>
      </div>

      {/* Target Config Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Configuração de Metas Orçamentárias do Mês</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Meta de Receita Bruta (R$)</label>
            <input
              type="number"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Meta de Lucro Líquido (R$)</label>
            <input
              type="number"
              value={targetProfit}
              onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Meta de Margem Líquida (%)</label>
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receita Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Receita de Vendas</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {(revenueProgress || 0).toFixed(1)}% Meta
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(realizedRevenue)}
            </div>
            <p className="text-slate-500 mt-1">Meta: {formatCurrency(targetRevenue)}</p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, revenueProgress || 0))}%` }}
            />
          </div>
        </div>

        {/* Lucro Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Lucro Líquido Realizado</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {(profitProgress || 0).toFixed(1)}% Meta
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(realizedProfit)}
            </div>
            <p className="text-slate-500 mt-1">Meta: {formatCurrency(targetProfit)}</p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, profitProgress || 0))}%` }}
            />
          </div>
        </div>

        {/* Margem Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Margem Líquida Obtida</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              {(marginProgress || 0).toFixed(1)}% da Meta
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {(realizedMargin || 0).toFixed(1)}%
            </div>
            <p className="text-slate-500 mt-1">Meta: {(targetMargin || 0).toFixed(1)}%</p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, marginProgress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
