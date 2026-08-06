import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { Lot, LotPaymentStatus, LotPickupStatus } from "../types";
import { ApportionmentModal } from "./ApportionmentModal";
import { BulkItemModal } from "./BulkItemModal";
import { ConfirmModal } from "./ConfirmModal";
import {
  Boxes,
  Plus,
  Search,
  Calculator,
  PackagePlus,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  X,
  ChevronRight,
  Gavel,
  Pencil,
  Trash2,
} from "lucide-react";

export const LotsView: React.FC = () => {
  const { lots, auctions, addLot, updateLot, deleteLot, items, openApportionmentModal, setIsBulkModalOpen, setActiveTab } = useAuction();

  const [search, setSearch] = useState("");
  const [sortFilter, setSortFilter] = useState<
    "padrao" | "maior_margem" | "menor_margem" | "maior_markup" | "menor_markup" | "maior_custo" | "menor_custo"
  >("padrao");
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  // Helper to compute metrics for a lot for sorting
  const getLotMetrics = (l: Lot) => {
    const lotItems = items.filter((i) => i.lotId === l.id);
    const totalEstimatedSale = lotItems.reduce((sum, item) => sum + (item.estimatedMarketAvg || 0), 0);
    const totalItemsCost = lotItems.reduce((sum, item) => sum + (item.realTotalCost || 0), 0);
    const costBase = totalItemsCost > 0 ? totalItemsCost : l.totalLotCost;
    const estimatedProfit = totalEstimatedSale - costBase;
    const markupPct = costBase > 0 ? (estimatedProfit / costBase) * 100 : 0;
    const marginOnSalePct = totalEstimatedSale > 0 ? (estimatedProfit / totalEstimatedSale) * 100 : 0;
    return {
      totalEstimatedSale,
      costBase,
      estimatedProfit,
      markupPct,
      marginOnSalePct,
      cost: l.totalLotCost,
    };
  };

  const filteredLots = lots
    .filter((l) => {
      const auc = auctions.find((a) => a.id === l.auctionId);
      return (
        l.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        auc?.name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortFilter === "padrao") return 0;
      const mA = getLotMetrics(a);
      const mB = getLotMetrics(b);
      if (sortFilter === "maior_margem") return mB.marginOnSalePct - mA.marginOnSalePct;
      if (sortFilter === "menor_margem") return mA.marginOnSalePct - mB.marginOnSalePct;
      if (sortFilter === "maior_markup") return mB.markupPct - mA.markupPct;
      if (sortFilter === "menor_markup") return mA.markupPct - mB.markupPct;
      if (sortFilter === "maior_custo") return mB.cost - mA.cost;
      if (sortFilter === "menor_custo") return mA.cost - mB.cost;
      return 0;
    });
  const [isNewLotOpen, setIsNewLotOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);

  // New/Edit Lot Form State
  const [auctionId, setAuctionId] = useState(auctions[0]?.id || "");
  const [lotNumber, setLotNumber] = useState("");
  const [description, setDescription] = useState("");
  const [winningBid, setWinningBid] = useState<number>(0);
  const [auctioneerCommission, setAuctioneerCommission] = useState<number>(0);
  const [adminFee, setAdminFee] = useState<number>(0);
  const [taxes, setTaxes] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [disassemblyCost, setDisassemblyCost] = useState<number>(0);
  const [loadingCost, setLoadingCost] = useState<number>(0);
  const [storageCost, setStorageCost] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(0);
  const [paymentDeadline, setPaymentDeadline] = useState("2026-08-20");
  const [pickupDeadline, setPickupDeadline] = useState("2026-08-27");
  const [paymentStatus, setPaymentStatus] = useState<LotPaymentStatus>("pago");
  const [pickupStatus, setPickupStatus] = useState<LotPickupStatus>("retirado");
  const [notes, setNotes] = useState("");
  const [deletingLot, setDeletingLot] = useState<Lot | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const handleOpenNew = () => {
    setEditingLot(null);
    setAuctionId(auctions[0]?.id || "");
    setLotNumber("");
    setDescription("");
    setWinningBid(0);
    setAuctioneerCommission(0);
    setAdminFee(0);
    setTaxes(0);
    setTransportCost(0);
    setDisassemblyCost(0);
    setLoadingCost(0);
    setStorageCost(0);
    setOtherCosts(0);
    setNotes("");
    setIsNewLotOpen(true);
  };

  const handleOpenEdit = (lot: Lot) => {
    setEditingLot(lot);
    setAuctionId(lot.auctionId);
    setLotNumber(lot.lotNumber);
    setDescription(lot.description);
    setWinningBid(lot.winningBid);
    setAuctioneerCommission(lot.auctioneerCommission);
    setAdminFee(lot.adminFee);
    setTaxes(lot.taxes);
    setTransportCost(lot.transportCost);
    setDisassemblyCost(lot.disassemblyCost);
    setLoadingCost(lot.loadingCost);
    setStorageCost(lot.storageCost);
    setOtherCosts(lot.otherCosts);
    setPaymentDeadline(lot.paymentDeadline || "2026-08-20");
    setPickupDeadline(lot.pickupDeadline || "2026-08-27");
    setPaymentStatus(lot.paymentStatus);
    setPickupStatus(lot.pickupStatus);
    setNotes(lot.notes || "");
    setIsNewLotOpen(true);
  };

  const handleDeleteLot = (id: string, num: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o lote "${num}"?`)) {
      deleteLot(id);
    }
  };

  const handleSaveLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber || !winningBid) return;

    if (editingLot) {
      updateLot(editingLot.id, {
        auctionId,
        lotNumber,
        description,
        winningBid: Number(winningBid),
        auctioneerCommission: Number(auctioneerCommission),
        adminFee: Number(adminFee),
        taxes: Number(taxes),
        transportCost: Number(transportCost),
        disassemblyCost: Number(disassemblyCost),
        loadingCost: Number(loadingCost),
        storageCost: Number(storageCost),
        otherCosts: Number(otherCosts),
        paymentDeadline,
        pickupDeadline,
        paymentStatus,
        pickupStatus,
        notes,
      });
    } else {
      addLot({
        auctionId,
        lotNumber,
        description,
        winningBid: Number(winningBid),
        auctioneerCommission: Number(auctioneerCommission),
        adminFee: Number(adminFee),
        taxes: Number(taxes),
        transportCost: Number(transportCost),
        disassemblyCost: Number(disassemblyCost),
        loadingCost: Number(loadingCost),
        storageCost: Number(storageCost),
        otherCosts: Number(otherCosts),
        itemCount: 0,
        paymentDeadline,
        pickupDeadline,
        paymentStatus,
        pickupStatus,
        notes,
      });
    }

    setIsNewLotOpen(false);
    setEditingLot(null);
    setLotNumber("");
    setDescription("");
    setWinningBid(0);
    setAuctioneerCommission(0);
    setAdminFee(0);
    setTaxes(0);
    setTransportCost(0);
    setDisassemblyCost(0);
    setLoadingCost(0);
    setStorageCost(0);
    setOtherCosts(0);
    setNotes("");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            <span>Módulo de Lotes Arrematados</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle do custo total do lote, taxas, transportes e rateio proporcional entre os bens
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Lote</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por número do lote, leilão, descrição..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="padrao">Organizar por: Padrão</option>
            <option value="maior_margem">Maior Margem (Venda %)</option>
            <option value="menor_margem">Menor Margem (Venda %)</option>
            <option value="maior_markup">Maior Markup (Custo %)</option>
            <option value="menor_markup">Menor Markup (Custo %)</option>
            <option value="maior_custo">Maior Custo Total</option>
            <option value="menor_custo">Menor Custo Total</option>
          </select>
        </div>
      </div>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLots.map((lot) => {
          const auc = auctions.find((a) => a.id === lot.auctionId);
          const lotItems = items.filter((i) => i.lotId === lot.id);

          // Soma dos valores estimados de mercado de todos os itens cadastrados deste lote
          const totalEstimatedSale = lotItems.reduce((sum, item) => sum + (item.estimatedMarketAvg || 0), 0);
          // Soma do custo real total dos itens cadastrados (ou custo do lote)
          const totalItemsCost = lotItems.reduce((sum, item) => sum + (item.realTotalCost || 0), 0);
          const costBase = totalItemsCost > 0 ? totalItemsCost : lot.totalLotCost;
          // Lucro estimado (Venda estimada - Custo dos itens ou total do lote)
          const estimatedProfit = totalEstimatedSale - costBase;
          // 3 - Markup sobre o custo (%) = (Lucro / Custo) * 100
          const markupPct = costBase > 0 ? (estimatedProfit / costBase) * 100 : 0;
          // 4 - Margem sobre a venda (%) = (Lucro / Venda Estimada) * 100
          const marginOnSalePct = totalEstimatedSale > 0 ? (estimatedProfit / totalEstimatedSale) * 100 : 0;

          return (
            <div
              key={lot.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {lot.lotNumber}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(lot)}
                        title="Editar Lote"
                        className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingLot(lot)}
                        title="Excluir Lote"
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {lot.description}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Custo Total Lote</span>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                      {formatCurrency(lot.totalLotCost)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Leilão: <strong className="text-slate-800 dark:text-slate-200">{auc?.name || "N/A"}</strong>
                </div>

                {/* Resumo com os 4 Indicadores: Venda, Lucro, Markup e Margem sobre Venda */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      1. Venda Est. ({lotItems.length} it.)
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                      {formatCurrency(totalEstimatedSale)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      2. Lucro Est.
                    </span>
                    <strong
                      className={`font-extrabold text-xs ${
                        estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      }`}
                    >
                      {estimatedProfit >= 0 ? "+" : ""}{formatCurrency(estimatedProfit)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      3. Markup/Custo
                    </span>
                    <strong
                      className={`font-extrabold text-xs ${
                        markupPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      }`}
                    >
                      {markupPct >= 0 ? "+" : ""}{markupPct.toFixed(1)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      4. Margem/Venda
                    </span>
                    <strong
                      className={`font-extrabold text-xs ${
                        marginOnSalePct >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500"
                      }`}
                    >
                      {marginOnSalePct >= 0 ? "+" : ""}{marginOnSalePct.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Costs breakdown chips: Lance Vencedor | Custos Extras | Custo Rateado | Itens no Lote */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Lance Vencedor</span>
                    <strong className="text-slate-900 dark:text-white">{formatCurrency(lot.winningBid)}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Custos Extras</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(
                        (lot.auctioneerCommission || 0) +
                          (lot.adminFee || 0) +
                          (lot.taxes || 0) +
                          (lot.transportCost || 0) +
                          (lot.disassemblyCost || 0) +
                          (lot.loadingCost || 0) +
                          (lot.storageCost || 0) +
                          (lot.otherCosts || 0)
                      )}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Custo Rateado</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(
                        lotItems.length > 0
                          ? lot.totalLotCost / lotItems.length
                          : (lot.itemCount || 1) > 0
                          ? lot.totalLotCost / (lot.itemCount || 1)
                          : lot.totalLotCost
                      )}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Itens no Lote</span>
                    <strong className="text-amber-600 dark:text-amber-400">{lotItems.length} cadastrados</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => openApportionmentModal(lot)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Ratear Custo do Lote</span>
                </button>

                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>Gerar Itens em Massa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Lot Modal */}
      {isNewLotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsNewLotOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-500" />
                <span>{editingLot ? "Editar Lote" : "Cadastrar Novo Lote"}</span>
              </h3>
              <button
                onClick={() => setIsNewLotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLot} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selecione o Leilão Origem *
                  </label>
                  <select
                    required
                    value={auctionId}
                    onChange={(e) => setAuctionId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">Selecione o leilão...</option>
                    {auctions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.auctioneer})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número do Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="Ex: Lote 04B"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Resumida do Lote
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Lote com 15 Notebooks Dell e Acessórios"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lance Vencedor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={winningBid}
                    onChange={(e) => setWinningBid(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Comissão Leiloeiro (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={auctioneerCommission}
                    onChange={(e) => setAuctioneerCommission(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Taxa Adm / Serv. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adminFee}
                    onChange={(e) => setAdminFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Impostos / ICMS (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxes}
                    onChange={(e) => setTaxes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frete / Transporte (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carregamento / Outros (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={loadingCost}
                    onChange={(e) => setLoadingCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLotOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Salvar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Exclusão de Lote */}
      <ConfirmModal
        isOpen={!!deletingLot}
        title="Excluir Lote do Leilão"
        message={`Tem certeza que deseja excluir o lote "${deletingLot?.lotNumber}"? Todos os itens cadastrados pertencentes a este lote no inventário também serão removidos.`}
        confirmText="Excluir Lote"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deletingLot) {
            deleteLot(deletingLot.id);
            setDeletingLot(null);
          }
        }}
        onCancel={() => setDeletingLot(null)}
      />
    </div>
  );
};
