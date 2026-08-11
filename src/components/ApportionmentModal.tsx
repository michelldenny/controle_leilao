import React, { useState, useEffect, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { Lot, ApportionmentMethod } from "../types";
import { apportionLotCostExact } from "../services/financialMath";
import { Calculator, X, AlertCircle, Check, Percent, DollarSign, Scale, Plus, PackagePlus } from "lucide-react";

interface ApportionmentModalProps {
  lot: Lot;
  onClose: () => void;
}

export const ApportionmentModal: React.FC<ApportionmentModalProps> = ({ lot, onClose }) => {
  const { items, apportionLotCost, setIsWizardOpen, setIsBulkModalOpen } = useAuction();

  const lotItems = items.filter((i) => i.lotId === lot.id);
  const [method, setMethod] = useState<ApportionmentMethod>("igualitario");

  // State for custom inputs (percents or amounts)
  const [customValues, setCustomValues] = useState<{ [itemId: string]: number }>({});

  useEffect(() => {
    // Initialize default values
    const initialMap: { [itemId: string]: number } = {};
    const activeLotItems = lotItems.filter((i) => i.status !== "descartado");
    const activeCount = Math.max(activeLotItems.length, 1);

    if (lotItems.length > 0) {
      lotItems.forEach((it) => {
        if (it.status === "descartado") {
          initialMap[it.id] = 0;
        } else {
          initialMap[it.id] =
            method === "percentual"
              ? it.assignedPercent || Number((100 / activeCount).toFixed(2))
              : method === "manual"
              ? it.apportionedCost || Number((lot.totalLotCost / activeCount).toFixed(2))
              : 0;
        }
      });
    }
    setCustomValues(initialMap);
  }, [method, lot.id]);

  const handleInputChange = (itemId: string, val: number) => {
    setCustomValues((prev) => ({ ...prev, [itemId]: val }));
  };

  const payload = useMemo(() => {
    return Object.keys(customValues).map((itemId) => ({
      itemId,
      value: customValues[itemId] || 0,
    }));
  }, [customValues]);

  // Prévia exata utilizando o mesmo serviço de cálculo
  const previewResults = useMemo(() => {
    return apportionLotCostExact(lot.totalLotCost || 0, lotItems, method, payload);
  }, [lot.totalLotCost, lotItems, method, payload]);

  const handleApply = () => {
    apportionLotCost(lot.id, method, payload);
    onClose();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const totalAssignedInInputs = (Object.values(customValues) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ferramenta Inteligente de Rateio de Custo do Lote
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lote {lot.lotNumber} • Custo Total a Distribuir:{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                  {formatCurrency(lot.totalLotCost)}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Escolha o Método de Rateio:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setMethod("igualitario")}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                method === "igualitario"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Scale className="w-5 h-5 shrink-0" />
              <span>Igualitário</span>
              <span className="text-[10px] font-normal text-slate-400">Divisão exata</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("valor_estimado")}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                method === "valor_estimado"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <DollarSign className="w-5 h-5 shrink-0" />
              <span>Por Valor de Mercado</span>
              <span className="text-[10px] font-normal text-slate-400">Proporcional ao valor</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("percentual")}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                method === "percentual"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Percent className="w-5 h-5 shrink-0" />
              <span>Por Percentual (%)</span>
              <span className="text-[10px] font-normal text-slate-400">Definição manual %</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("manual")}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                method === "manual"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Calculator className="w-5 h-5 shrink-0" />
              <span>Valor Fixo (R$)</span>
              <span className="text-[10px] font-normal text-slate-400">Valor direto por item</span>
            </button>
          </div>
        </div>

        {/* Live Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Itens no Lote ({lotItems.length})
            </span>
            {method === "percentual" && (
              <span
                className={`font-semibold ${
                  Math.abs(totalAssignedInInputs - 100) < 0.1 ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                Soma dos percentuais: {totalAssignedInInputs.toFixed(1)}% / 100%
              </span>
            )}
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
            {lotItems.length === 0 ? (
              <div className="p-8 text-center space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Nenhum Item Cadastrado neste Lote
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O rateio divide o custo total do lote ({formatCurrency(lot.totalLotCost)}) entre os itens individuais que o compõem. Para realizar o rateio, cadastre os itens deste lote primeiro:
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsWizardOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Item Individual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsBulkModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Gerar Itens em Massa</span>
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="p-3 text-left">Código / Item</th>
                    <th className="p-3 text-center">Atribuição / %</th>
                    <th className="p-3 text-center">Custo Rateado</th>
                    <th className="p-3 text-center">Valor Venda</th>
                    <th className="p-3 text-center">Lucro / R$</th>
                    <th className="p-3 text-center">Margem / %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lotItems.map((item) => {
                    const isDiscarded = item.status === "descartado";
                    const foundRes = previewResults.find((r) => r.itemId === item.id);

                    const previewApportioned = isDiscarded ? 0 : foundRes?.apportionedCost || 0;
                    const previewPercent = isDiscarded ? 0 : foundRes?.assignedPercent || 0;
                    const previewRealTotal = isDiscarded ? 0 : foundRes?.realTotalCost || (item.additionalCosts || 0);

                    const isSold = item.status === "vendido" || item.isSold;
                    const isOwnUse = item.status === "uso_proprio";
                    const salePrice = item.listedPrice || item.estimatedMarketAvg || 0;
                    const profit = salePrice - previewRealTotal;
                    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

                    const rowBgClass = isSold
                      ? "bg-emerald-100/70 dark:bg-emerald-900/35 border-l-4 border-l-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                      : isOwnUse
                      ? "bg-purple-100/70 dark:bg-purple-900/35 border-l-4 border-l-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      : isDiscarded
                      ? "opacity-60 bg-slate-100/50 dark:bg-slate-900/40"
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50";

                    return (
                      <tr key={item.id} className={rowBgClass}>
                        <td className="p-3 text-left font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isSold && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-600 text-white dark:bg-emerald-500 border border-emerald-600 whitespace-nowrap">
                                Vendido
                              </span>
                            )}
                            {isOwnUse && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-600 text-white dark:bg-purple-500 border border-purple-600 whitespace-nowrap">
                                Uso Próprio
                              </span>
                            )}
                            {isDiscarded && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 whitespace-nowrap">
                                Descartado (R$ 0,00)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                            {item.code}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          {method === "percentual" ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="1"
                                value={customValues[item.id] ?? 0}
                                onChange={(e) => handleInputChange(item.id, Number(e.target.value))}
                                className="w-16 p-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                              <span>%</span>
                            </div>
                          ) : method === "manual" ? (
                            <div className="flex items-center justify-center gap-1">
                              <span>R$</span>
                              <input
                                type="number"
                                step="10"
                                value={customValues[item.id] ?? 0}
                                onChange={(e) => handleInputChange(item.id, Number(e.target.value))}
                                className="w-24 p-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {previewPercent.toFixed(1)}%
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(previewApportioned)}
                        </td>

                        <td className="p-3 text-center text-slate-600 dark:text-slate-300 font-semibold">
                          {formatCurrency(salePrice)}
                        </td>

                        <td className={`p-3 text-center font-bold ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {formatCurrency(profit)}
                        </td>

                        <td className={`p-3 text-center font-extrabold ${margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {margin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {lotItems.length > 0 && (() => {
                  let totalPercent = 0;
                  let totalApportioned = 0;
                  let totalSale = 0;
                  let totalProfit = 0;

                  lotItems.forEach((item) => {
                    const isDiscarded = item.status === "descartado";
                    const foundRes = previewResults.find((r) => r.itemId === item.id);

                    const previewApportioned = isDiscarded ? 0 : foundRes?.apportionedCost || 0;
                    const previewPercent = isDiscarded ? 0 : foundRes?.assignedPercent || 0;
                    const previewRealTotal = isDiscarded ? 0 : foundRes?.realTotalCost || (item.additionalCosts || 0);

                    const salePrice = item.listedPrice || item.estimatedMarketAvg || 0;
                    const profit = salePrice - previewRealTotal;

                    totalPercent += previewPercent;
                    totalApportioned += previewApportioned;
                    totalSale += salePrice;
                    totalProfit += profit;
                  });

                  const overallMargin = totalSale > 0 ? (totalProfit / totalSale) * 100 : 0;

                  return (
                    <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                      <tr>
                        <td className="p-3 text-left">TOTAL DO LOTE</td>
                        <td className="p-3 text-center">{totalPercent.toFixed(1)}%</td>
                        <td className="p-3 text-center text-amber-600 dark:text-amber-400">{formatCurrency(totalApportioned)}</td>
                        <td className="p-3 text-center">{formatCurrency(totalSale)}</td>
                        <td className={`p-3 text-center ${totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {formatCurrency(totalProfit)}
                        </td>
                        <td className={`p-3 text-center ${overallMargin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {overallMargin.toFixed(1)}%
                        </td>
                      </tr>
                    </tfoot>
                  );
                })()}
              </table>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            * O custo real total atualiza automaticamente as margens de lucro e ROI de cada item.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Rateio Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
