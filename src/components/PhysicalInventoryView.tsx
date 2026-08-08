import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { formatCurrency } from "../lib/dateUtils";
import { QrCode, Scan, CheckCircle, AlertTriangle, RefreshCw, ArrowRightLeft, FileSpreadsheet, User, MapPin } from "lucide-react";

export const PhysicalInventoryView: React.FC = () => {
  const { items, updateItem, addToast } = useAuction();
  const [scanCode, setScanCode] = useState("");
  const [scannedItems, setScannedItems] = useState<{ [code: string]: boolean }>({});
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");

  const [transferItemId, setTransferItemId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [transferResponsible, setTransferResponsible] = useState("");

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    const matched = items.find(
      (i) => i.code.toLowerCase() === scanCode.trim().toLowerCase() || i.id === scanCode.trim()
    );

    if (matched) {
      setScannedItems((prev) => ({ ...prev, [matched.code]: true }));
      addToast("Item Contado!", `Item #${matched.code} (${matched.name}) confirmado no inventário físico.`);
    } else {
      addToast("Divergência Detectada", `Código #${scanCode} não encontrado no sistema.`, "warning");
    }

    setScanCode("");
  };

  const handleExecuteTransfer = () => {
    if (!transferItemId || !newLocation.trim()) return;
    updateItem(transferItemId, { locationText: newLocation.trim() });
    addToast("Transferência Concluída", `Bem transferido para "${newLocation.trim()}" sob responsabilidade de ${transferResponsible || "Operador"}.`);
    setTransferItemId(null);
    setNewLocation("");
    setTransferResponsible("");
  };

  // Itens em Estoque Físico Esperado (não vendidos e não descartados)
  const expectedItems = useMemo(() => {
    return items.filter((i) => !i.isSold && i.status !== "descartado");
  }, [items]);

  const filteredExpected = useMemo(() => {
    if (selectedLocationFilter === "all") return expectedItems;
    return expectedItems.filter((i) => (i.locationText || "Sem Localização") === selectedLocationFilter);
  }, [expectedItems, selectedLocationFilter]);

  const locationsList = useMemo(() => {
    const set = new Set<string>();
    expectedItems.forEach((i) => set.add(i.locationText || "Sem Localização"));
    return Array.from(set);
  }, [expectedItems]);

  const countedCount = useMemo(() => {
    return expectedItems.filter((i) => scannedItems[i.code]).length;
  }, [expectedItems, scannedItems]);

  const missingCount = expectedItems.length - countedCount;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scan className="w-6 h-6 text-amber-500" />
            <span>Inventário Físico, Contagem Cíclica & Leitura QR</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scanner de códigos de barra/QR, relatório automatizado de divergências e controle de transferência de localização.
          </p>
        </div>
      </div>

      {/* Barcode/QR Scanner Simulation Input */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <QrCode className="w-5 h-5" />
          <span>Leitor de Código de Barras / QR Code Ativo</span>
        </div>

        <form onSubmit={handleScanSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Escaneie ou digite o código do item (ex: ITM-0001)..."
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all shadow-md cursor-pointer"
          >
            Registrar Contagem
          </button>
        </form>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Bens Esperados em Estoque</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {expectedItems.length}
          </div>
          <p className="text-slate-500">Itens ativos no inventário</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Bens Confirmados / Contados</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {countedCount}
          </div>
          <p className="text-slate-500">Bens fisicamente bipados no ciclo</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Pendentes de Contagem</span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {missingCount}
          </div>
          <p className="text-slate-500">Bens ainda não bipados nesta contagem</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Acurácia do Inventário</span>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {expectedItems.length > 0 ? ((countedCount / expectedItems.length) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-slate-500">Percentual verificado fisicamente</p>
        </div>
      </div>

      {/* Inventory List & Transfer Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Lista do Inventário Físico Esperado</h3>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Localização:</span>
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="all">Todas as Localizações ({expectedItems.length})</option>
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">Código / Nome</th>
              <th className="p-4">Localização Atual</th>
              <th className="p-4">Status / Categoria</th>
              <th className="p-4 text-right">Custo Real (R$)</th>
              <th className="p-4 text-center">Status Contagem</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredExpected.map((item) => {
              const isCounted = !!scannedItems[item.code];
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-amber-600 dark:text-amber-400 mr-2">#{item.code}</span>
                    {item.name}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.locationText || "Sem Localização"}</span>
                  </td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(item.realTotalCost || 0)}
                  </td>
                  <td className="p-4 text-center">
                    {isCounted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Confirmado / Bipado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        Pendente Contagem
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setTransferItemId(item.id);
                        setNewLocation(item.locationText || "");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Transferir</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {transferItemId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transferência de Localização de Bem</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Nova Localização Física</label>
                <input
                  type="text"
                  placeholder="Ex: Galpão B - Prateleira 4"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Operador / Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do responsável pela transferência"
                  value={transferResponsible}
                  onChange={(e) => setTransferResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setTransferItemId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-4 py-2 rounded-xl bg-amber-500 font-bold text-slate-950 cursor-pointer"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
