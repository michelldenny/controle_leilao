import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem, ItemStatus, ItemCondition } from "../types";
import { EditItemModal } from "./EditItemModal";
import {
  Package,
  Search,
  Filter,
  Grid,
  List,
  Download,
  QrCode,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
  FileText,
  Tag,
  CheckSquare,
  Square,
  Plus,
  Zap,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { ConfirmModal } from "./ConfirmModal";

interface InventoryViewProps {
  onSelectQrCode?: (item: AuctionItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onSelectQrCode }) => {
  const {
    items,
    auctions,
    lots,
    sales,
    openItemDetail,
    openAiModal,
    globalSearch,
    setGlobalSearch,
    setIsWizardOpen,
    deleteItem,
  } = useAuction();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<AuctionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AuctionItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [conditionFilter, setConditionFilter] = useState<string>("todas");
  const [auctionFilter, setAuctionFilter] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<string>("recentes");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // Available Categories
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = globalSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q) ||
        item.location.customText.toLowerCase().includes(q);

      const matchesCat = categoryFilter === "todas" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "todos" || item.status === statusFilter;
      const matchesCond = conditionFilter === "todas" || item.condition === conditionFilter;
      const matchesAuc = auctionFilter === "todos" || item.auctionId === auctionFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesCond && matchesAuc;
    }).sort((a, b) => {
      if (sortBy === "custo_desc") return b.realTotalCost - a.realTotalCost;
      if (sortBy === "custo_asc") return a.realTotalCost - b.realTotalCost;
      if (sortBy === "valor_desc") return b.estimatedMarketAvg - a.estimatedMarketAvg;
      if (sortBy === "nome") return a.name.localeCompare(b.name);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  }, [items, globalSearch, categoryFilter, statusFilter, conditionFilter, auctionFilter, sortBy]);

  // Bulk Select Toggle
  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = (selectedItemIds.length > 0
      ? items.filter((i) => selectedItemIds.includes(i.id))
      : filteredItems
    ).map((item) => ({
      Código: item.code,
      Item: item.name,
      Categoria: item.category,
      Marca: item.brand || "",
      Modelo: item.model || "",
      Condição: item.condition,
      Estado: item.operationalState,
      "Custo Rateado": item.apportionedCost,
      "Despesas Ext.": item.additionalCosts,
      "Custo Total Real": item.realTotalCost,
      "Valor Estimado Média": item.estimatedMarketAvg,
      "Preço Anunciado": item.listedPrice || 0,
      Status: item.status,
      Localização: item.location.customText,
      "Data Entrada": item.dateAdded,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario_Leilao");
    XLSX.writeFile(workbook, `Inventario_Leiloes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Inventário de Leilões", 14, 18);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 25);

    let y = 35;
    const targetItems = selectedItemIds.length > 0
      ? items.filter((i) => selectedItemIds.includes(i.id))
      : filteredItems;

    targetItems.slice(0, 25).forEach((item, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. [${item.code}] ${item.name}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Cat: ${item.category} | Custo: R$ ${item.realTotalCost.toFixed(2)} | Est: R$ ${item.estimatedMarketAvg.toFixed(2)} | Status: ${item.status}`,
        14,
        y + 5
      );
      y += 12;
    });

    doc.save(`Relatorio_Inventario_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const getStatusBadge = (st: ItemStatus) => {
    switch (st) {
      case "disponivel":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "anunciado":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "vendido":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "em_manutencao":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "aguardando_retirada":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
      case "em_transporte":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "armazenado":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "reservado":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
      case "uso_proprio":
        return "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20";
      case "descartado":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Página de Inventário</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão individualizada dos bens arrematados, rastreio de localização, custos e valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={exportToPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar por código, nome, marca, modelo, localização..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                title="Visualização em Cards/Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="todas">Todas Categoria</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="todos">Todos Status</option>
              <option value="disponivel">Disponível</option>
              <option value="anunciado">Anunciado</option>
              <option value="vendido">Vendido</option>
              <option value="em_manutencao">Em Manutenção</option>
              <option value="aguardando_retirada">Aguardando Retirada</option>
              <option value="em_transporte">Em Transporte</option>
              <option value="armazenado">Armazenado</option>
              <option value="reservado">Reservado</option>
              <option value="uso_proprio">Uso Próprio (Patrimônio)</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Condição:</span>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="todas">Todas Condições</option>
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
              <option value="usado">Usado</option>
              <option value="avariado">Avariado</option>
              <option value="sucata">Sucata</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Ordenar Por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="custo_desc">Maior Custo Real</option>
              <option value="custo_asc">Menor Custo Real</option>
              <option value="valor_desc">Maior Valor Estimado</option>
              <option value="nome">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Counter Bar */}
      {selectedItemIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <span>{selectedItemIds.length} itens selecionados</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Selecionados ({selectedItemIds.length})</span>
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition-colors"
            >
              Exportar Selecionados para Excel
            </button>
            <button
              onClick={() => setSelectedItemIds([])}
              className="text-slate-500 hover:underline"
            >
              Limpar seleção
            </button>
          </div>
        </div>
      )}

      {/* Main Content Render */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1350px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400">
                      {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-center">Foto / Código</th>
                  <th className="p-3 text-center">Item / Descrição</th>
                  <th className="p-3 text-center">Categoria</th>
                  <th className="p-3 text-center">Custo Real Total</th>
                  <th className="p-3 text-center">Valor Venda</th>
                  <th className="p-3 text-center">% Markup</th>
                  <th className="p-3 text-center">Margem</th>
                  <th className="p-3 text-center">Dias Estoque</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredItems.map((item) => {
                  const lot = lots.find((l) => l.id === item.lotId);
                  const isSelected = selectedItemIds.includes(item.id);

                  // Lucro estimado em relação ao valor estimado
                  const profitEst = item.estimatedMarketAvg - item.realTotalCost;
                  const markupPct = item.realTotalCost > 0
                    ? (profitEst / item.realTotalCost) * 100
                    : 0;
                  const marginPct = item.estimatedMarketAvg > 0
                    ? (profitEst / item.estimatedMarketAvg) * 100
                    : 0;

                  // Dias no estoque
                  const purchaseDateStr = item.purchaseDate || item.dateAdded;
                  let endDate = new Date();
                  if (item.status === "vendido" || item.isSold) {
                    const saleRecord = sales.find((s) => s.itemId === item.id);
                    if (saleRecord?.saleDate) {
                      endDate = new Date(saleRecord.saleDate);
                    }
                  }
                  let daysInStock = 0;
                  if (purchaseDateStr) {
                    const pDate = new Date(purchaseDateStr);
                    const diffTime = endDate.getTime() - pDate.getTime();
                    daysInStock = Math.max(0, Math.floor(diffTime / (1000 * 3600 * 24)));
                  }

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors ${isSelected ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                        }`}
                    >
                      <td className="p-3 text-center">
                        <button onClick={() => toggleSelectItem(item.id)} className="text-slate-400">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={item.primaryPhoto}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="text-left">
                            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                              {item.code}
                            </span>
                            <span className="text-[10px] text-slate-400">{lot?.lotNumber || "Lote"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center max-w-xs">
                        <button
                          onClick={() => openItemDetail(item.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 text-center line-clamp-1 mx-auto"
                        >
                          {item.name}
                        </button>
                        <p className="text-[11px] text-slate-400 line-clamp-1 text-center">{item.brand} {item.model}</p>
                      </td>

                      <td className="p-3 text-center font-medium text-slate-600 dark:text-slate-300">
                        {item.category}
                      </td>

                      <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.realTotalCost)}
                      </td>

                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.estimatedMarketAvg)}
                      </td>

                      <td className="p-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${markupPct >= 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                        >
                          {markupPct >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {markupPct >= 0 ? "+" : ""}{markupPct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${marginPct >= 0
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                        >
                          {marginPct >= 0 ? "+" : ""}{marginPct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="p-3 text-center font-semibold">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold">
                          {daysInStock} {daysInStock === 1 ? "dia" : "dias"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border whitespace-nowrap ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openItemDetail(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Editar Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                            title="Excluir Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectQrCode && onSelectQrCode(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Imprimir Etiqueta / QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW - 5 cards por linha em telas grandes */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={item.primaryPhoto}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border backdrop-blur-md shadow-sm whitespace-nowrap ${getStatusBadge(
                    item.status
                  )}`}
                >
                  {item.status.replace(/_/g, " ")}
                </span>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-slate-950/70 text-amber-400 backdrop-blur-md">
                  {item.code}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item.category} • {item.location.customText}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Custo Real</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(item.realTotalCost)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Valuation Média</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.estimatedMarketAvg)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-200/50 dark:hover:bg-slate-700"
                    title="Editar Item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                    title="Excluir Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openAiModal(item)}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-500/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>IA</span>
                  </button>
                </div>

                <button
                  onClick={() => openItemDetail(item.id)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-colors"
                >
                  <span>Detalhes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <EditItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />

      <ConfirmModal
        isOpen={!!deletingItem}
        title="Excluir Item do Inventário"
        message={`Tem certeza que deseja excluir o item ${deletingItem?.code} (${deletingItem?.name})? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Item"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deletingItem) {
            deleteItem(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />

      <ConfirmModal
        isOpen={isBulkDeleting}
        title="Excluir Múltiplos Itens"
        message={`Tem certeza que deseja excluir os ${selectedItemIds.length} itens selecionados do inventário? Esta ação é irreversível.`}
        confirmText={`Excluir ${selectedItemIds.length} Itens`}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          selectedItemIds.forEach((id) => deleteItem(id));
          setSelectedItemIds([]);
          setIsBulkDeleting(false);
        }}
        onCancel={() => setIsBulkDeleting(false)}
      />
    </div>
  );
};
