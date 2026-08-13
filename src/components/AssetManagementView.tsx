import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { calculateLinearDepreciation } from "../services/financialMath";
import { formatCurrency } from "../lib/dateUtils";
import { Building, Trash2, ShieldAlert, Award, Calculator, Calendar, User, FileText, CheckCircle } from "lucide-react";

export const AssetManagementView: React.FC = () => {
  const { items, updateItem, addToast } = useAuction();
  const [activeSubTab, setActiveSubTab] = useState<"own_use" | "discard">("own_use");

  const [discardModalItemId, setDiscardModalItemId] = useState<string | null>(null);
  const [discardReason, setDiscardReason] = useState("");
  const [scrapValue, setScrapValue] = useState("0");
  const [discardApprovedBy, setDiscardApprovedBy] = useState("");

  // Bens Retidos para Uso Próprio (Patrimônio)
  const ownUseItems = useMemo(() => {
    return items.filter((i) => i.status === "uso_proprio");
  }, [items]);

  // Bens Descartados (Baixa Patrimonial)
  const discardedItems = useMemo(() => {
    return items.filter((i) => i.status === "descartado");
  }, [items]);

  const handleConfirmDiscard = () => {
    if (!discardModalItemId || !discardReason.trim()) return;

    const numericScrap = parseFloat(scrapValue) || 0;

    updateItem(discardModalItemId, {
      status: "descartado",
      isSold: false,
    });

    addToast(
      "Baixa Patrimonial Efetuada",
      `Descarte registrado com sucesso. Perda financeira isolada sem contaminação do custo dos demais itens.`
    );

    setDiscardModalItemId(null);
    setDiscardReason("");
    setScrapValue("0");
    setDiscardApprovedBy("");
  };

  const totalOwnUseCost = useMemo(() => ownUseItems.reduce((acc, i) => acc + (i.realTotalCost || 0), 0), [ownUseItems]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-500" />
            <span>Gestão de Patrimônio Próprio & Descarte Formal</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Incorporação patrimonial, centro de custo, vida útil, depreciação linear e controle formal de baixas.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Bens em Uso Próprio</span>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {ownUseItems.length}
          </div>
          <p className="text-slate-500">Patrimônio imobilizado ativo</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Valor de Custo Imobilizado</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalOwnUseCost)}
          </div>
          <p className="text-slate-500">Custo histórico acumulado de aquisição</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Total de Baixas / Descartes</span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {discardedItems.length}
          </div>
          <p className="text-slate-500">Bens com baixa patrimonial aprovada</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveSubTab("own_use")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeSubTab === "own_use"
              ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Bens em Uso Próprio ({ownUseItems.length})
        </button>

        <button
          onClick={() => setActiveSubTab("discard")}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeSubTab === "discard"
              ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Histórico de Baixas & Descarte ({discardedItems.length})
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
        {activeSubTab === "own_use" ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Código / Bem</th>
                <th className="p-4">Incorporação / Data</th>
                <th className="p-4 text-right">Custo Aquisição (R$)</th>
                <th className="p-4 text-right">Depreciação Acumulada (R$)</th>
                <th className="p-4 text-right">Valor Contábil Líquido (R$)</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {ownUseItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    Nenhum bem imobilizado para uso próprio.
                  </td>
                </tr>
              ) : (
                ownUseItems.map((item) => {
                  const dep = calculateLinearDepreciation(item.realTotalCost || 0, 60, 12, 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <span className="font-mono text-amber-600 dark:text-amber-400 mr-2">#{item.code}</span>
                        {item.name}
                      </td>
                      <td className="p-4 text-slate-500">{item.dateAdded || "-"}</td>
                      <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.realTotalCost || 0)}
                      </td>
                      <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(dep.accumulatedDepreciation)}
                      </td>
                      <td className="p-4 text-right font-extrabold text-teal-600 dark:text-teal-400">
                        {formatCurrency(dep.bookValue)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setDiscardModalItemId(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold transition-colors cursor-pointer"
                        >
                          Solicitar Baixa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {ownUseItems.length > 0 && (() => {
              let totalAcq = 0;
              let totalDep = 0;
              let totalBook = 0;

              ownUseItems.forEach((item) => {
                const dep = calculateLinearDepreciation(item.realTotalCost || 0, 60, 12, 0);
                totalAcq += item.realTotalCost || 0;
                totalDep += dep.accumulatedDepreciation;
                totalBook += dep.bookValue;
              });

              return (
                <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <tr>
                    <td className="p-4 text-left" colSpan={2}>
                      TOTAL DO PATRIMÔNIO IMOBILIZADO ({ownUseItems.length} bens)
                    </td>
                    <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(totalAcq)}
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(totalDep)}
                    </td>
                    <td className="p-4 text-right font-extrabold text-teal-600 dark:text-teal-400">
                      {formatCurrency(totalBook)}
                    </td>
                    <td className="p-4 text-center">-</td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Código / Bem Descartado</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-right">Custo Perdido (R$)</th>
                <th className="p-4 text-center">Status / Efeito Contábil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {discardedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                    Nenhuma baixa por descarte registrada.
                  </td>
                </tr>
              ) : (
                discardedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <span className="font-mono text-amber-600 dark:text-amber-400 mr-2">#{item.code}</span>
                      {item.name}
                    </td>
                    <td className="p-4 text-slate-500">{item.category}</td>
                    <td className="p-4 text-right font-extrabold text-rose-600">
                      {formatCurrency(item.realTotalCost || 0)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Baixa Patrimonial isolada
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {discardedItems.length > 0 && (() => {
              const totalLostCost = discardedItems.reduce((acc, i) => acc + (i.realTotalCost || 0), 0);
              return (
                <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <tr>
                    <td className="p-4 text-left" colSpan={2}>
                      TOTAL DE BAIXAS / PERDA ACUMULADA ({discardedItems.length} bens)
                    </td>
                    <td className="p-4 text-right font-extrabold text-rose-600">
                      {formatCurrency(totalLostCost)}
                    </td>
                    <td className="p-4 text-center">-</td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        )}
      </div>

      {/* Discard Modal */}
      {discardModalItemId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Processo Formal de Baixa por Descarte</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Motivo do Descarte</label>
                <textarea
                  placeholder="Especifique a razão (ex: avaria irrecuperável, danos no transporte, sucateamento)..."
                  value={discardReason}
                  onChange={(e) => setDiscardReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Valor Recuperado de Sucata (R$)</label>
                <input
                  type="number"
                  value={scrapValue}
                  onChange={(e) => setScrapValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Aprovado por (Gestor)</label>
                <input
                  type="text"
                  placeholder="Nome do gestor aprovador"
                  value={discardApprovedBy}
                  onChange={(e) => setDiscardApprovedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDiscardModalItemId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Confirmar Baixa Patrimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
