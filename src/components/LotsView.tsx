import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { Lot, LotPaymentStatus, LotPickupStatus } from "../types";
import { ApportionmentModal } from "./ApportionmentModal";
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
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
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
  };

  const filteredLots = lots.filter((l) => {
    const auc = auctions.find((a) => a.id === l.auctionId);
    return (
      l.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      auc?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

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

      {/* Search */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por número do lote, leilão, descrição..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
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
          // Lucro estimado (Venda estimada - Custo dos itens ou total do lote)
          const estimatedProfit = totalEstimatedSale - (totalItemsCost > 0 ? totalItemsCost : lot.totalLotCost);

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
                        onClick={() => handleDeleteLot(lot.id, lot.lotNumber)}
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

                {/* Resumo de Valuation e Lucro Estimado do Lote */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      Venda Estimada Total ({lotItems.length} itens)
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      {formatCurrency(totalEstimatedSale)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      Lucro Estimado do Lote
                    </span>
                    <strong
                      className={`font-extrabold text-sm ${
                        estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      }`}
                    >
                      {estimatedProfit >= 0 ? "+" : ""}{formatCurrency(estimatedProfit)}
                    </strong>
                  </div>
                </div>

                {/* Costs breakdown chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Lance Vencedor</span>
                    <strong className="text-slate-900 dark:text-white">{formatCurrency(lot.winningBid)}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Comissão/Taxas</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(lot.auctioneerCommission + lot.adminFee + lot.taxes)}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                    <span className="text-slate-400 block text-[10px]">Transporte/Log.</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatCurrency(lot.transportCost + lot.disassemblyCost + lot.loadingCost)}
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {auctions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.auctioneer})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número / Código do Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="Ex: Lote 15 / Lote 04-A"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Descrição do Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Lote contendo 10 Notebooks Dell e 2 Monitores LG"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor do Lance Vencedor (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={winningBid}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setWinningBid(val);
                      setAuctioneerCommission(val * 0.05); // 5% default
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Comissão do Leiloeiro (R$)
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
                    Taxa Administrativa (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adminFee}
                    onChange={(e) => setAdminFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Impostos (R$)
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
                    Custo de Transporte / Frete (R$)
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
                    Desmontagem / Carregamento / Outros (R$)
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
    </div>
  );
};
