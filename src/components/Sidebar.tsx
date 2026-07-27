import React from "react";
import { useAuction } from "../context/AuctionContext";
import {
  LayoutDashboard,
  Gavel,
  Boxes,
  Package,
  Megaphone,
  ShoppingBag,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Lightbulb,
  Sparkles,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, darkMode, toggleDarkMode, metrics } = useAuction();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "auctions", label: "Leilões", icon: Gavel },
    { id: "lots", label: "Lotes", icon: Boxes },
    { id: "inventory", label: "Inventário", icon: Package, badge: metrics.totalItemsCount },
    { id: "advertisements", label: "Anúncios", icon: Megaphone, badge: metrics.advertisedCount },
    { id: "sales", label: "Vendas & ROI", icon: ShoppingBag, badge: metrics.soldItemsCount },
    { id: "financial", label: "Financeiro", icon: DollarSign },
    { id: "bi", label: "BI & Capital", icon: TrendingUp },
    { id: "opportunities", label: "Oportunidades", icon: Lightbulb, badge: "IA", badgeColor: "bg-amber-500 text-white" },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "contacts", label: "Contatos", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 z-20 ${
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
                Gestão & Revenda Pro
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
          return (
            <button
              key={item.id}
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
