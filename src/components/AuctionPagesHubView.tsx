import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { Auction } from "../types";
import {
  Layers,
  Plus,
  Search,
  Users,
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Gavel,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface AuctionPagesHubViewProps {
  onOpenNewPageModal: () => void;
}

export const AuctionPagesHubView: React.FC<AuctionPagesHubViewProps> = ({
  onOpenNewPageModal,
}) => {
  const { auctions, items, lots, sales, openAuctionPage, deleteAuction } = useAuction();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // Filtered auctions
  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const q = searchTerm.toLowerCase();
      const matchName = auction.name.toLowerCase().includes(q);
      const matchAuctioneer = auction.auctioneer.toLowerCase().includes(q);
      const matchPartner = (auction.partners || []).some((p) =>
        p.name.toLowerCase().includes(q)
      );

      const matchSearch = !q || matchName || matchAuctioneer || matchPartner;
      const matchStatus = statusFilter === "todos" || auction.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [auctions, searchTerm, statusFilter]);

  // Global Hub Stats
  const hubStats = useMemo(() => {
    const totalPages = auctions.length;
    const allPartners = new Set<string>();

    auctions.forEach((a) => {
      (a.partners || []).forEach((p) => allPartners.add(p.name));
    });

    const totalItems = items.length;
    const totalInvested = lots.reduce((acc, l) => acc + (l.totalLotCost || 0), 0);
    const totalProfit = sales.reduce((acc, s) => acc + (s.netProfit || 0), 0);

    return {
      totalPages,
      totalPartnersCount: allPartners.size,
      totalItems,
      totalInvested,
      totalProfit,
    };
  }, [auctions, items, lots, sales]);

  // Color mapping helper
  const getColorClasses = (colorTag?: string) => {
    switch (colorTag) {
      case "emerald":
        return {
          border: "border-emerald-500/30",
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          dot: "bg-emerald-500",
        };
      case "blue":
        return {
          border: "border-blue-500/30",
          badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          dot: "bg-blue-500",
        };
      case "purple":
        return {
          border: "border-purple-500/30",
          badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          dot: "bg-purple-500",
        };
      case "rose":
        return {
          border: "border-rose-500/30",
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          dot: "bg-rose-500",
        };
      case "teal":
        return {
          border: "border-teal-500/30",
          badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          dot: "bg-teal-500",
        };
      default:
        return {
          border: "border-amber-500/30",
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dot: "bg-amber-500",
        };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Layers className="w-4 h-4" />
            <span>Gestão Multi-Leilões & Sociedades</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Páginas Próprias por Leilão
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            Cada leilão e sociedade possui sua página com painel de itens 100% isolado.
            Gerencie lotes, estoques e divisão de lucros entre sócios sem misturar mercadorias.
          </p>
        </div>

        <button
          onClick={onOpenNewPageModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>+ Criar Nova Página de Leilão</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Páginas de Leilão</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {hubStats.totalPages}
          </div>
          <div className="text-[11px] text-slate-400">Painéis independentes</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sócios em Carteira</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {hubStats.totalPartnersCount}
          </div>
          <div className="text-[11px] text-slate-400">Participantes ativos</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Capital Investido</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(hubStats.totalInvested)}
          </div>
          <div className="text-[11px] text-slate-400">Total em arrematações</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lucro Líquido Realizado</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(hubStats.totalProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Resultado das vendas
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por leilão, leiloeiro ou nome de sócio..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="participando">Participando / Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="futuro">Futuro</option>
          </select>
        </div>
      </div>

      {/* Auction Pages Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Nenhuma página de leilão encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Crie a primeira página de leilão para ter um painel exclusivo de itens e divisão de lucros com seus sócios.
            </p>
          </div>
          <button
            onClick={onOpenNewPageModal}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
          >
            + Criar Página de Leilão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuctions.map((auction) => {
            const auctionLots = lots.filter((l) => l.auctionId === auction.id);
            const auctionItems = items.filter((i) => i.auctionId === auction.id);
            const totalLotsCost = auctionLots.reduce((acc, l) => acc + (l.totalLotCost || 0), 0);
            const totalEstimated = auctionItems.reduce((acc, i) => acc + (i.estimatedMarketAvg || 0), 0);

            const partners = auction.partners && auction.partners.length > 0
              ? auction.partners
              : [{ id: "p1", name: "Titular (100%)", sharePercentage: 100 }];

            const colorStyle = getColorClasses(auction.colorTag);

            return (
              <div
                key={auction.id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Top Bar of Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colorStyle.dot}`} />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {auction.platform || "Leilão"}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        auction.status === "concluido"
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {auction.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {auction.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Gavel className="w-3.5 h-3.5 text-amber-500" />
                        {auction.auctioneer}
                      </span>
                      {auction.auctionDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {auction.auctionDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partners Badges */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sócios da Arrematação:</span>
                      </span>
                      <span>{partners.length} sócio(s)</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {partners.map((p, idx) => (
                        <span
                          key={p.id || idx}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1"
                        >
                          <span>{p.name}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black">
                            ({p.sharePercentage}%)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                      <span className="text-[10px] text-slate-400 block">Itens no Painel</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {auctionItems.length} itens ({auctionLots.length} lotes)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                      <span className="text-[10px] text-slate-400 block">Capital Investido</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(totalLotsCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openAuctionPage(auction.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    <span>Entrar no Painel de Itens</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir a página do leilão "${auction.name}"?`)) {
                        deleteAuction(auction.id);
                      }
                    }}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Excluir página"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
