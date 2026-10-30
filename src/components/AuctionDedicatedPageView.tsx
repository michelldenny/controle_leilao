import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem, Lot, AuctionPartner } from "../types";
import { EditItemModal } from "./EditItemModal";
import { ConfirmModal } from "./ConfirmModal";
import {
  Gavel,
  ArrowLeft,
  Users,
  Package,
  Boxes,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  QrCode,
  DollarSign,
  TrendingUp,
  Percent,
  Download,
  Share2,
  FileSpreadsheet,
  FileText,
  Calendar,
  MapPin,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface AuctionDedicatedPageViewProps {
  auctionId: string;
  onBack?: () => void;
  onSelectQrCode?: (item: AuctionItem) => void;
}

export const AuctionDedicatedPageView: React.FC<AuctionDedicatedPageViewProps> = ({
  auctionId,
  onBack,
  onSelectQrCode,
}) => {
  const {
    auctions,
    lots,
    items,
    sales,
    updateAuction,
    deleteItem,
    openItemDetail,
    openAuctionPage,
    openApportionmentModal,
    addLot,
    addItem,
    setActiveTab,
    addToast,
    registerSale,
  } = useAuction();

  // Find this specific auction
  const auction = useAuction().auctions.find((a) => a.id === auctionId);

  // Tab inside the page: "items" | "lots" | "partnership"
  const [activeSubTab, setActiveSubTab] = useState<"items" | "lots" | "partnership">("items");

  // Search & Filter state for this auction's items
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [editingItem, setEditingItem] = useState<AuctionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AuctionItem | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isEditPartnersOpen, setIsEditPartnersOpen] = useState(false);
  const [isDirectSaleModalOpen, setIsDirectSaleModalOpen] = useState(false);
  const [directSaleItem, setDirectSaleItem] = useState<AuctionItem | null>(null);

  // Direct sale form
  const [buyerName, setBuyerName] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("PIX");

  // Quick Add Item Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Eletrônicos & TI");
  const [newItemLotId, setNewItemLotId] = useState("");
  const [newItemCost, setNewItemCost] = useState(0);
  const [newItemEstimatedVal, setNewItemEstimatedVal] = useState(0);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemCondition, setNewItemCondition] = useState<any>("usado");

  // Partner edit state
  const [tempPartners, setTempPartners] = useState<AuctionPartner[]>([]);

  // Format currency
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  if (!auction) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Página de Leilão não encontrada</h2>
        <p className="text-sm text-slate-500">Este leilão pode ter sido removido ou o ID está incorreto.</p>
        <button
          onClick={onBack || (() => setActiveTab("auctions"))}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm"
        >
          Voltar para lista de Leilões
        </button>
      </div>
    );
  }

  // STRICTLY ISOLATED: Items of THIS auction ONLY
  const auctionItems = useMemo(() => {
    return items.filter((i) => i.auctionId === auction.id);
  }, [items, auction.id]);

  // STRICTLY ISOLATED: Lots of THIS auction ONLY
  const auctionLots = useMemo(() => {
    return lots.filter((l) => l.auctionId === auction.id);
  }, [lots, auction.id]);

  // Partners of this auction
  const partners = useMemo(() => {
    if (auction.partners && auction.partners.length > 0) {
      return auction.partners;
    }
    // Default fallback: 100% owner
    return [
      {
        id: "p1",
        name: "Administrador (100%)",
        sharePercentage: 100,
        notes: "Titular único",
      },
    ];
  }, [auction.partners]);

  // Filtered Items for this auction
  const filteredAuctionItems = useMemo(() => {
    return auctionItems.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q);

      const matchCat = categoryFilter === "todas" || item.category === categoryFilter;
      const matchStatus = statusFilter === "todos" || item.status === statusFilter;

      return matchQ && matchCat && matchStatus;
    });
  }, [auctionItems, searchTerm, categoryFilter, statusFilter]);

  // Financial Metrics of THIS auction
  const auctionMetrics = useMemo(() => {
    const totalLotsCost = auctionLots.reduce((acc, l) => acc + (l.totalLotCost || 0), 0);
    const totalItemApportioned = auctionItems.reduce((acc, i) => acc + (i.realTotalCost || 0), 0);
    const totalInvested = Math.max(totalLotsCost, totalItemApportioned);

    const totalEstimatedMarket = auctionItems.reduce((acc, i) => acc + (i.estimatedMarketAvg || 0), 0);

    const soldAuctionItems = auctionItems.filter((i) => i.isSold || i.status === "vendido");
    const soldIds = new Set(soldAuctionItems.map((i) => i.id));

    const auctionSales = sales.filter((s) => soldIds.has(s.itemId));
    const totalSoldAmount = auctionSales.reduce((acc, s) => acc + (s.finalPrice || 0), 0);
    const realizedProfit = auctionSales.reduce((acc, s) => acc + (s.netProfit || 0), 0);

    const availableCount = auctionItems.filter((i) => i.status === "disponivel" || i.status === "armazenado").length;
    const soldCount = soldAuctionItems.length;

    return {
      totalInvested,
      totalEstimatedMarket,
      totalSoldAmount,
      realizedProfit,
      totalItemsCount: auctionItems.length,
      availableCount,
      soldCount,
    };
  }, [auctionLots, auctionItems, sales]);

  // Partner Financial Breakdown
  const partnerBreakdown = useMemo(() => {
    return partners.map((partner) => {
      const shareRatio = (partner.sharePercentage || 0) / 100;
      const investedShare = auctionMetrics.totalInvested * shareRatio;
      const revenueShare = auctionMetrics.totalSoldAmount * shareRatio;
      const profitShare = auctionMetrics.realizedProfit * shareRatio;
      const valuationShare = auctionMetrics.totalEstimatedMarket * shareRatio;

      return {
        ...partner,
        investedShare,
        revenueShare,
        profitShare,
        valuationShare,
      };
    });
  }, [partners, auctionMetrics]);

  // Categories in this auction
  const availableCategories = useMemo(() => {
    const set = new Set(auctionItems.map((i) => i.category));
    return Array.from(set);
  }, [auctionItems]);

  // Open Edit Partners Modal
  const handleOpenEditPartners = () => {
    setTempPartners(JSON.parse(JSON.stringify(partners)));
    setIsEditPartnersOpen(true);
  };

  const handleSavePartners = () => {
    updateAuction(auction.id, { partners: tempPartners });
    setIsEditPartnersOpen(false);
    addToast("Sócios Atualizados", "A divisão da sociedade foi salva com sucesso.");
  };

  // Quick Add Item Submit
  const handleQuickAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let targetLotId = newItemLotId;
    if (!targetLotId && auctionLots.length > 0) {
      targetLotId = auctionLots[0].id;
    } else if (!targetLotId) {
      // create a default lot for this auction
      const lot = addLot({
        auctionId: auction.id,
        lotNumber: "001",
        description: `Lote Inicial - ${auction.name}`,
        winningBid: Number(newItemCost) || 0,
        auctioneerCommission: 0,
        adminFee: 0,
        taxes: 0,
        transportCost: 0,
        disassemblyCost: 0,
        loadingCost: 0,
        storageCost: 0,
        otherCosts: 0,
        itemCount: 1,
        paymentDeadline: new Date().toISOString().split("T")[0],
        pickupDeadline: new Date().toISOString().split("T")[0],
        paymentStatus: "pago",
        pickupStatus: "retirado",
      });
      targetLotId = lot.id;
    }

    addItem({
      auctionId: auction.id,
      lotId: targetLotId,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: Number(newItemQuantity) || 1,
      condition: newItemCondition,
      operationalState: "funcionando",
      location: { customText: "Painel do Leilão" },
      photos: [],
      primaryPhoto: "",
      status: "disponivel",
      originalCost: Number(newItemCost) || 0,
      apportionedCost: Number(newItemCost) || 0,
      additionalCosts: 0,
      estimatedMarketMin: Number(newItemEstimatedVal) * 0.9,
      estimatedMarketAvg: Number(newItemEstimatedVal) || 0,
      estimatedMarketMax: Number(newItemEstimatedVal) * 1.1,
      isAdvertised: false,
      isSold: false,
    });

    setNewItemName("");
    setNewItemCost(0);
    setNewItemEstimatedVal(0);
    setIsQuickAddOpen(false);
    addToast("Item Cadastrado", `Item adicionado exclusivamente ao painel deste leilão!`);
  };

  // Direct sale trigger
  const handleOpenDirectSale = (item: AuctionItem) => {
    setDirectSaleItem(item);
    setSalePrice(item.estimatedMarketAvg || item.realTotalCost || 0);
    setBuyerName("");
    setIsDirectSaleModalOpen(true);
  };

  const handleConfirmDirectSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSaleItem || !buyerName.trim()) return;

    registerSale(directSaleItem.id, {
      buyerName: buyerName.trim(),
      finalPrice: Number(salePrice),
      saleDate: new Date().toISOString().split("T")[0],
      platform: "Venda Direta Sociedade",
      paymentMethod,
      discount: 0,
      sellerFreight: 0,
      platformCommission: 0,
      taxes: 0,
      otherExpenses: 0,
      paymentStatus: "pago",
    });

    setIsDirectSaleModalOpen(false);
    setDirectSaleItem(null);
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const data = auctionItems.map((item) => ({
      Código: item.code,
      Item: item.name,
      Categoria: item.category,
      Condição: item.condition,
      Status: item.status,
      "Custo Total (R$)": item.realTotalCost,
      "Valor Estimado (R$)": item.estimatedMarketAvg,
      Vendido: item.isSold ? "Sim" : "Não",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Itens do Leilão");
    XLSX.writeFile(wb, `leilao_${auction.name.replace(/[^a-zA-Z0-9]/g, "_")}_itens.xlsx`);
    addToast("Exportado", "Relatório de itens exportado em Excel.");
  };

  // Export Partnership Statement PDF
  const handleExportPartnershipPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Prestação de Contas - ${auction.name}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Data: ${auction.auctionDate || "N/A"} | Leiloeiro: ${auction.auctioneer}`, 14, 28);
    doc.text(`Total de Itens: ${auctionMetrics.totalItemsCount} | Custo Total: R$ ${auctionMetrics.totalInvested.toFixed(2)}`, 14, 34);
    doc.text(`Total Vendido: R$ ${auctionMetrics.totalSoldAmount.toFixed(2)} | Lucro Líquido: R$ ${auctionMetrics.realizedProfit.toFixed(2)}`, 14, 40);

    doc.line(14, 44, 196, 44);

    doc.setFontSize(12);
    doc.text("Divisão por Sócio:", 14, 52);

    let y = 60;
    partnerBreakdown.forEach((p) => {
      doc.setFontSize(10);
      doc.text(
        `${p.name} (${p.sharePercentage}%) -> Investido: R$ ${p.investedShare.toFixed(2)} | Retorno: R$ ${p.revenueShare.toFixed(2)} | Lucro: R$ ${p.profitShare.toFixed(2)}`,
        14,
        y
      );
      y += 8;
    });

    doc.save(`prestacao_contas_${auction.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    addToast("PDF Gerado", "Relatório de prestação de contas gerado com sucesso.");
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack || (() => setActiveTab("auction_pages"))}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Todas as Páginas</span>
          </button>

          {/* Quick Auction Switcher Dropdown */}
          <div className="relative group">
            <select
              value={auction.id}
              onChange={(e) => openAuctionPage(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 focus:outline-none cursor-pointer"
            >
              {auctions.map((a) => (
                <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Alternar p/ {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPartnershipPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Prestação de contas da sociedade em PDF"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>PDF Sócios</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Exportar Itens para Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleOpenEditPartners}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Configurar Sócios ({partners.length})</span>
          </button>
        </div>
      </div>

      {/* Main Auction Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-500 text-slate-950 shadow-sm">
                Página Própria do Leilão
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white backdrop-blur-sm">
                {auction.status.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Painel de Itens 100% Isolado</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {auction.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-amber-400" />
                <span>{auction.auctioneer}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{auction.auctionDate || "Sem data"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{auction.city} / {auction.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Comissão {auction.commissionPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>+ Novo Item neste Leilão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Partners / Sociedade Quota Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sócios & Divisão Financeira da Sociedade
            </h2>
          </div>
          <button
            onClick={handleOpenEditPartners}
            className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            Editar porcentagens ou sócios
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerBreakdown.map((p, idx) => (
            <div
              key={p.id || idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {p.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {p.sharePercentage}%
                </span>
              </div>

              {p.notes && (
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{p.notes}</p>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Custo Atribuído:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(p.investedShare)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Retorno Vendas:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(p.revenueShare)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Lucro Líquido:</span>
                  <span
                    className={`font-bold ${
                      p.profitShare >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                    }`}
                  >
                    {formatCurrency(p.profitShare)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exclusive KPI Cards for this Auction */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total de Itens</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {auctionMetrics.totalItemsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {auctionMetrics.availableCount} disp. | {auctionMetrics.soldCount} vend.
          </div>
        </div>

        {/* Total Invested */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Capital Investido</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(auctionMetrics.totalInvested)}
          </div>
          <div className="text-[11px] text-slate-400">Lances + despesas</div>
        </div>

        {/* Valuation Estimado */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Valuation Estimado</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(auctionMetrics.totalEstimatedMarket)}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Valor de revenda</div>
        </div>

        {/* Total Vendido */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Vendido</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(auctionMetrics.totalSoldAmount)}
          </div>
          <div className="text-[11px] text-slate-400">{auctionMetrics.soldCount} itens vendidos</div>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lucro Líquido</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(auctionMetrics.realizedProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Líquido da sociedade
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab("items")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "items"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Painel de Itens Exclusivos ({auctionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("lots")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "lots"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Lotes Arrematados ({auctionLots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("partnership")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === "partnership"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Prestação de Contas & Sócios</span>
        </button>
      </div>

      {/* TAB 1: PAINEL DE ITENS (STRICTLY ISOLATED) */}
      {activeSubTab === "items" && (
        <div className="space-y-4">
          {/* Isolation Notice Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Painel Isolado:</strong> Todos os itens exibidos abaixo pertencem unicamente ao leilão{" "}
                <strong>{auction.name}</strong>. Nenhum item se mistura com os seus outros leilões ou sócios.
              </span>
            </div>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="px-3 py-1.5 font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
            >
              + Adicionar Item Aqui
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código, nome, marca neste leilão..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="todas">Todas Categorias</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="disponivel">Disponível</option>
                <option value="armazenado">Armazenado</option>
                <option value="em_manutencao">Em Manutenção</option>
                <option value="vendido">Vendido</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg ${
                    viewMode === "table" ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm" : "text-slate-400"
                  }`}
                  title="Visualização em Lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg ${
                    viewMode === "grid" ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm" : "text-slate-400"
                  }`}
                  title="Visualização em Grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items Empty State */}
          {filteredAuctionItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  Nenhum item cadastrado neste leilão
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Este painel é exclusivo para os itens deste leilão/sociedade. Clique no botão abaixo para adicionar os
                  bens arrematados.
                </p>
              </div>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
              >
                + Adicionar Primeiro Item
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Item & Código</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Condição</th>
                      <th className="py-3 px-4">Custo Total</th>
                      <th className="py-3 px-4">Valor Estimado</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredAuctionItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.primaryPhoto ? (
                              <img
                                src={item.primaryPhoto}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                              <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                                {item.code}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.category}</td>

                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.condition}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.realTotalCost)}
                        </td>

                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.estimatedMarketAvg)}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              item.isSold || item.status === "vendido"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : item.status === "disponivel"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!item.isSold && item.status !== "vendido" && (
                              <button
                                onClick={() => handleOpenDirectSale(item)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                title="Registrar Venda deste Item"
                              >
                                Vender
                              </button>
                            )}

                            <button
                              onClick={() => openItemDetail(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Ver Detalhes do Item"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              title="Editar Item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {onSelectQrCode && (
                              <button
                                onClick={() => onSelectQrCode(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                title="QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Excluir Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAuctionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-900">
                    {item.primaryPhoto ? (
                      <img
                        src={item.primaryPhoto}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/70 text-white backdrop-blur-sm">
                      {item.code}
                    </span>

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm ${
                        item.isSold
                          ? "bg-emerald-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {item.category}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {item.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Custo:</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(item.realTotalCost)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Venda Estimada:</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.estimatedMarketAvg)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => openItemDetail(item.id)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors text-center mr-2"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOTES DESTE LEILÃO */}
      {activeSubTab === "lots" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Lotes Cadastrados neste Leilão ({auctionLots.length})
            </h3>
            <button
              onClick={() => setActiveTab("lots")}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              Gerenciar Lotes Completos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctionLots.map((lot) => (
              <div
                key={lot.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    LOTE #{lot.lotNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(lot.totalLotCost)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {lot.description}
                </p>

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Lance vencedor:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(lot.winningBid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete / Transporte:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(lot.transportCost)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openApportionmentModal(lot)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  Ratear Custo do Lote entre os Itens
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRESTAÇÃO DE CONTAS & SÓCIOS */}
      {activeSubTab === "partnership" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Demonstrativo Financeiro da Sociedade
                </h3>
                <p className="text-xs text-slate-500">
                  Quadro de apuração de resultados para conferência e repasse aos sócios.
                </p>
              </div>
              <button
                onClick={handleExportPartnershipPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF de Prestação de Contas</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Sócio</th>
                    <th className="py-3 px-4">Cota (%)</th>
                    <th className="py-3 px-4">Capital Investido</th>
                    <th className="py-3 px-4">Faturamento (Vendas)</th>
                    <th className="py-3 px-4">Lucro Líquido a Repassar</th>
                    <th className="py-3 px-4">Estoque Estimado a Vender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {partnerBreakdown.map((p) => (
                    <tr key={p.id} className="font-medium text-slate-800 dark:text-slate-200">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {p.name}
                        {p.phone && <div className="text-[10px] text-slate-400">{p.phone}</div>}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {p.sharePercentage}%
                      </td>
                      <td className="py-3 px-4">{formatCurrency(p.investedShare)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.revenueShare)}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.profitShare)}
                      </td>
                      <td className="py-3 px-4 text-purple-600 dark:text-purple-400">
                        {formatCurrency(p.valuationShare)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {auction.societyNotes && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Regras & Acordo da Sociedade:</span>
                <p className="text-slate-600 dark:text-slate-400">{auction.societyNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK ADD ITEM MODAL */}
      {isQuickAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsQuickAddOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  + Novo Item no Leilão: {auction.name}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  🔒 Este item ficará exclusivamente neste painel
                </p>
              </div>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Descrição do Item *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Impressora Laser HP LaserJet Pro"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Eletrônicos & TI">Eletrônicos & TI</option>
                    <option value="Veículos & Peças">Veículos & Peças</option>
                    <option value="Maquinário & Indústria">Maquinário & Indústria</option>
                    <option value="Móveis & Corporativo">Móveis & Corporativo</option>
                    <option value="Eletrodomésticos">Eletrodomésticos</option>
                    <option value="Sucata & Descarte">Sucata & Descarte</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Condição
                  </label>
                  <select
                    value={newItemCondition}
                    onChange={(e) => setNewItemCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="usado">Usado</option>
                    <option value="seminovo">Seminovo</option>
                    <option value="novo">Novo</option>
                    <option value="avariado">Avariado</option>
                    <option value="sucata">Sucata</option>
                    <option value="nao_testado">Não Testado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Custo de Arrematação / Rateio (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Preço Estimado de Venda (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={newItemEstimatedVal}
                    onChange={(e) => setNewItemEstimatedVal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md"
                >
                  Adicionar ao Painel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARTNERS MODAL */}
      {isEditPartnersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsEditPartnersOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Sócios da Sociedade: {auction.name}
                </h3>
                <p className="text-xs text-slate-500">Defina as pessoas e suas porcentagens de participação.</p>
              </div>
              <button
                onClick={() => setIsEditPartnersOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {tempPartners.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...tempPartners];
                        updated[idx].name = e.target.value;
                        setTempPartners(updated);
                      }}
                      placeholder="Nome do Sócio"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    />

                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={p.sharePercentage}
                        onChange={(e) => {
                          const updated = [...tempPartners];
                          updated[idx].sharePercentage = Number(e.target.value);
                          setTempPartners(updated);
                        }}
                        className="w-full px-2 py-1.5 text-right font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>

                    {tempPartners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTempPartners(tempPartners.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={p.phone || ""}
                      onChange={(e) => {
                        const updated = [...tempPartners];
                        updated[idx].phone = e.target.value;
                        setTempPartners(updated);
                      }}
                      placeholder="WhatsApp / Telefone"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      value={p.notes || ""}
                      onChange={(e) => {
                        const updated = [...tempPartners];
                        updated[idx].notes = e.target.value;
                        setTempPartners(updated);
                      }}
                      placeholder="Observações do sócio"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setTempPartners([
                    ...tempPartners,
                    {
                      id: "p-" + crypto.randomUUID(),
                      name: `Novo Sócio ${tempPartners.length + 1}`,
                      sharePercentage: 0,
                    },
                  ])
                }
                className="w-full py-2 text-xs font-bold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors"
              >
                + Adicionar Outro Sócio
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditPartnersOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePartners}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md"
              >
                Salvar Sócios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT SALE MODAL */}
      {isDirectSaleModalOpen && directSaleItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsDirectSaleModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Venda do Item: {directSaleItem.name}
              </h3>
              <button
                onClick={() => setIsDirectSaleModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDirectSale} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Comprador *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valor Final de Venda (R$) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold text-emerald-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDirectSaleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md"
                >
                  Confirmar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Excluir Item do Leilão"
        message={`Tem certeza que deseja excluir o item "${deletingItem?.name}" deste painel? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingItem) {
            deleteItem(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
