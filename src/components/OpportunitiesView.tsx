import React from "react";
import { useAuction } from "../context/AuctionContext";
import { Lightbulb, Sparkles, Megaphone, Clock, AlertCircle, TrendingUp, ChevronRight } from "lucide-react";

export const OpportunitiesView: React.FC = () => {
  const { items, openItemDetail, openAiModal } = useAuction();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // High Margin Items (> 80% potential ROI)
  const highMarginItems = (items || []).filter(
    (i) => i.status !== "vendido" && i.estimatedMarketAvg > i.realTotalCost * 1.8
  );

  // Unadvertised Items (disponivel but no ad)
  const unadvertisedItems = (items || []).filter(
    (i) => i.status === "disponivel" && (i.advertisements || []).length === 0
  );

  // Unassessed Items
  const unassessedItems = (items || []).filter((i) => i.estimatedMarketAvg === 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <span>Central de Oportunidades & Aceleração</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recomendações automatizadas para liquidação rápida do estoque e maximização do ROI
          </p>
        </div>
      </div>

      {/* Grid of Opportunity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* High Margin Items */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Itens com Alta Margem Estimada (&gt; 80% ROI)</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600">
              {highMarginItems.length} Oportunidades
            </span>
          </div>

          <div className="space-y-2">
            {highMarginItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openItemDetail(item.id)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                  <span className="text-[10px] text-slate-400">Custo: {formatCurrency(item.realTotalCost)}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Valuation</span>
                  <strong className="font-extrabold text-emerald-600">{formatCurrency(item.estimatedMarketAvg)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unadvertised Items */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
              <Megaphone className="w-4 h-4" />
              <span>Prontos para Venda e Sem Anúncio</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600">
              {unadvertisedItems.length} Itens
            </span>
          </div>

          <div className="space-y-2">
            {unadvertisedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                  <span className="text-[10px] text-slate-400">Pronto p/ publicar no Mercado Livre / OLX</span>
                </div>

                <button
                  onClick={() => openAiModal(item)}
                  className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Anúncio IA</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
