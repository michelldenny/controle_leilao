import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import {
  LayoutDashboard,
  Gavel,
  Boxes,
  Package,
  ShoppingBag,
  Store,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building,
  Layers,
  Plus,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenNewAuctionPage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  onOpenNewAuctionPage,
}) => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    metrics,
    auctions,
    selectedAuctionPageId,
    openAuctionPage,
  } = useAuction();

  const [auctionSubmenuOpen, setAuctionSubmenuOpen] = useState(true);

  // Filtered menu items - Removed: Anúncios, Financeiro, Razão & ledger, Aging & Giro, Metas e Indicadores, Oportunidades
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "auction_pages",
      label: "Páginas por Leilão",
      icon: Layers,
      badge: auctions.length,
      badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold",
    },
    { id: "auctions", label: "Leilões (Geral)", icon: Gavel },
    { id: "lots", label: "Lotes", icon: Boxes },
    { id: "inventory", label: "Inventário Geral", icon: Package, badge: metrics.totalItemsCount },
    { id: "sales", label: "Vendas & ROI", icon: ShoppingBag, badge: metrics.soldItemsCount },
    {
      id: "marketplace",
      label: "Vitrine Virtual",
      icon: Store,
      badge: metrics.availableItemsCount,
      badgeColor: "bg-emerald-500 text-slate-950",
    },
    { id: "accounts", label: "Contas Pagar/Receber", icon: DollarSign },
    { id: "profitability", label: "Rentabilidade", icon: BarChart3 },
    { id: "bi", label: "BI & Capital", icon: TrendingUp },
    { id: "assets", label: "Patrimônio & Descarte", icon: Building },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "contacts", label: "Contatos", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col border-r transition-all duration-300 z-20 shrink-0 ${
        darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
      } ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 shrink-0">
            <Gavel className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white leading-tight">
                Patrimônio Leilões
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Gestão & Sociedades Pro
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAuctionPagesTab = item.id === "auction_pages";

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                  isActive
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                />

                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                )}
              </button>

              {/* Nested Auction Pages List when "Páginas por Leilão" is active or expanded */}
              {isAuctionPagesTab && !collapsed && auctions.length > 0 && (
                <div className="pl-6 pr-1 py-1 space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    <span>Painéis Isolados</span>
                    {onOpenNewAuctionPage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewAuctionPage();
                        }}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-0.5"
                        title="Nova Página de Leilão"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Novo</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
                    {auctions.map((auc) => {
                      const isPageActive =
                        activeTab === "auction_page" && selectedAuctionPageId === auc.id;

                      return (
                        <button
                          key={auc.id}
                          onClick={() => openAuctionPage(auc.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isPageActive
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isPageActive ? "bg-amber-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <span className="truncate flex-1">{auc.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            darkMode ? "bg-slate-800 text-amber-400 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            {!collapsed && <span>{darkMode ? "Modo Claro" : "Modo Escuro"}</span>}
          </div>
        </button>
      </div>
    </aside>
  );
};
