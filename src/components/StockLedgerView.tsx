import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { StockLedgerEntry, LedgerEventType } from "../types/ledger";
import { formatCurrency } from "../lib/dateUtils";
import {
  FileText,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Download,
  Calendar,
  User,
  Tag,
  ShieldCheck,
  Building,
} from "lucide-react";

export const StockLedgerView: React.FC = () => {
  const { activityLogs, items, sales, expenses, lots } = useAuction();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Reconstrução em tempo real dos lançamentos da Razão de Estoque & Ledger Imutável
  const ledgerEntries = useMemo<StockLedgerEntry[]>(() => {
    const list: StockLedgerEntry[] = [];

    // Entradas por aquisição de itens
    items.forEach((item) => {
      list.push({
        id: `led-acq-${item.id}`,
        organizationId: item.organizationId || "org-default",
        itemId: item.id,
        lotId: item.lotId,
        auctionId: item.auctionId,
        eventType: "ACQUISITION",
        description: `Entrada em estoque do item ${item.code} - ${item.name}`,
        amountChange: item.apportionedCost || item.originalCost || 0,
        costBasis: item.realTotalCost || 0,
        marketEstimate: item.estimatedMarketAvg || 0,
        user: "Sistema / Leilão",
        timestamp: item.dateAdded || new Date().toISOString(),
      });

      if (item.status === "uso_proprio") {
        list.push({
          id: `led-own-${item.id}`,
          organizationId: item.organizationId || "org-default",
          itemId: item.id,
          lotId: item.lotId,
          auctionId: item.auctionId,
          eventType: "OWN_USE_RETENTION",
          description: `Retenção de patrimônio para uso próprio: ${item.name}`,
          amountChange: 0,
          costBasis: item.realTotalCost || 0,
          marketEstimate: item.estimatedMarketAvg || 0,
          user: "Administrador",
          timestamp: item.dateAdded || new Date().toISOString(),
        });
      }

      if (item.status === "descartado") {
        list.push({
          id: `led-disc-${item.id}`,
          organizationId: item.organizationId || "org-default",
          itemId: item.id,
          lotId: item.lotId,
          auctionId: item.auctionId,
          eventType: "DISCARD",
          description: `Baixa por descarte de bem avariado/sem reparo: ${item.name}`,
          amountChange: -(item.realTotalCost || 0),
          costBasis: item.realTotalCost || 0,
          marketEstimate: 0,
          user: "Operador",
          timestamp: item.dateAdded || new Date().toISOString(),
        });
      }
    });

    // Lançamentos de despesas adicionais
    expenses.forEach((exp) => {
      list.push({
        id: `led-exp-${exp.id}`,
        organizationId: exp.organizationId || "org-default",
        itemId: exp.itemId,
        eventType: "ADDITIONAL_EXPENSE",
        description: `Despesa adicional acumulada no custo: ${exp.description} (${exp.category})`,
        amountChange: exp.amount,
        costBasis: exp.amount,
        marketEstimate: 0,
        user: "Financeiro",
        timestamp: exp.date || exp.createdAt || new Date().toISOString(),
      });
    });

    // Lançamentos de vendas
    sales.forEach((sale) => {
      list.push({
        id: `led-sale-${sale.id}`,
        organizationId: sale.organizationId || "org-default",
        itemId: sale.itemId,
        eventType: "SALE",
        description: `Venda concluída para ${sale.buyerName} via ${sale.platform}. CMV Congelado: ${formatCurrency(sale.costBasisAtSale || 0)}.`,
        amountChange: sale.netSaleValue,
        costBasis: sale.costBasisAtSale || 0,
        marketEstimate: sale.listedPrice || 0,
        user: sale.createdBy || "Vendedor",
        timestamp: sale.saleDate || sale.createdAt || new Date().toISOString(),
      });
    });

    // Ordenar do mais recente para o mais antigo
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return list;
  }, [items, expenses, sales]);

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.itemId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "all" || entry.eventType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [ledgerEntries, searchTerm, selectedType]);

  const getEventBadge = (type: LedgerEventType) => {
    switch (type) {
      case "ACQUISITION":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Aquisição</span>;
      case "SALE":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Venda Concluída</span>;
      case "ADDITIONAL_EXPENSE":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Despesa Adicional</span>;
      case "SALE_REVERSAL":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Estorno Venda</span>;
      case "OWN_USE_RETENTION":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">Uso Próprio</span>;
      case "DISCARD":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Baixa Descarte</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">{type}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Data,Tipo,Descricao,Impacto_Financeiro,Custo_Base,Usuario\n";
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.eventType}","${e.description.replace(/"/g, '""')}",${e.amountChange},${e.costBasis},"${e.user}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `razao_estoque_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Razão de Estoque & Ledger Imutável</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Histórico contábil auditável de movimentações, CMV congelado, aquisições, despesas e liquidações.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Razão (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, código de item ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">Todos os Tipos de Eventos</option>
            <option value="ACQUISITION">Aquisição de Item</option>
            <option value="ADDITIONAL_EXPENSE">Despesa Adicional</option>
            <option value="SALE">Venda Concluída</option>
            <option value="SALE_REVERSAL">Estorno de Venda</option>
            <option value="OWN_USE_RETENTION">Retenção (Uso Próprio)</option>
            <option value="DISCARD">Baixa por Descarte</option>
          </select>
        </div>

        <div className="flex items-center justify-end font-bold text-slate-500">
          <span>{filteredEntries.length} Lançamento(s) Registrado(s)</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Data / Timestamp</th>
                <th className="p-4">Tipo de Evento</th>
                <th className="p-4">Descrição da Operação</th>
                <th className="p-4 text-right">Custo Base (R$)</th>
                <th className="p-4 text-right">Impacto Financeiro (R$)</th>
                <th className="p-4 text-center">Usuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Nenhum lançamento contábil encontrado no ledger.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 whitespace-nowrap text-slate-500 font-mono">
                      {entry.timestamp.substring(0, 16).replace("T", " ")}
                    </td>
                    <td className="p-4 whitespace-nowrap">{getEventBadge(entry.eventType)}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white max-w-md">
                      {entry.description}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatCurrency(entry.costBasis)}
                    </td>
                    <td className="p-4 text-right font-extrabold whitespace-nowrap">
                      <span className={entry.amountChange >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {entry.amountChange >= 0 ? `+${formatCurrency(entry.amountChange)}` : formatCurrency(entry.amountChange)}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap font-medium text-slate-500 flex items-center justify-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{entry.user}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
