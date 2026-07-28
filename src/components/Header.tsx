import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Gavel,
  ShoppingBag,
  PackagePlus,
  Boxes,
  Zap,
  Database,
  Trash2,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    globalSearch,
    setGlobalSearch,
    userRole,
    setUserRole,
    alerts,
    setIsWizardOpen,
    setIsBulkModalOpen,
    openAiModal,
    setActiveTab,
    isFirebaseConnected,
    clearAllDatabaseData,
  } = useAuction();

  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      {/* Search Input */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveTab("inventory");
              }
            }}
            placeholder="Buscar por código, item, leilão, lote, marca, localização..."
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Real Database Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Database className="w-3.5 h-3.5 animate-pulse" />
          <span>Firestore Ativo</span>
        </div>

        {/* Zerar Dados Button */}
        <button
          onClick={() => setShowConfirmReset(true)}
          title="Apagar todos os dados do banco real"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Zerar Banco</span>
        </button>

        {/* IA Assistant Button */}
        <button
          onClick={() => openAiModal()}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>IA Leilões</span>
        </button>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Ações Rápidas</span>
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 text-xs">
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setIsWizardOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>+ Fluxo Completo Arrematação</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setIsBulkModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium"
              >
                <PackagePlus className="w-4 h-4 text-blue-500" />
                <span>+ Cadastro de Itens em Massa</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setActiveTab("auctions");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium"
              >
                <Gavel className="w-4 h-4 text-purple-500" />
                <span>+ Novo Leilão</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setActiveTab("lots");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium"
              >
                <Boxes className="w-4 h-4 text-emerald-500" />
                <span>+ Novo Lote</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setActiveTab("sales");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium border-t border-slate-100 dark:border-slate-700"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>+ Registrar Venda</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setShowConfirmReset(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium border-t border-slate-100 dark:border-slate-700"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Zerar Todos os Dados</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {alerts.length}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Central de Alertas & Prazos</span>
                <span className="text-[10px] text-slate-500 font-medium">{alerts.length} pendentes</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          al.severity === "high"
                            ? "text-red-500"
                            : al.severity === "medium"
                            ? "text-amber-500"
                            : "text-blue-500"
                        }`}
                      />
                      <span className="truncate">{al.title}</span>
                    </div>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      {al.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <UserCheck className="w-4 h-4 text-amber-500" />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="admin">Perfil: Administrador</option>
            <option value="operador">Perfil: Operador</option>
            <option value="financeiro">Perfil: Financeiro</option>
            <option value="consulta">Perfil: Consulta</option>
          </select>
        </div>
      </div>

      {/* Modal de confirmação de Zerar Banco de Dados (fecha ao clicar fora) */}
      {showConfirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowConfirmReset(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 rounded-2xl bg-red-500/10">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Zerar Banco de Dados Real</h3>
                <p className="text-xs text-slate-500">Limpar todos os dados cadastrados</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Deseja remover todos os leilões, lotes, itens, vendas, despesas e cadastros do banco de dados Firebase? Essa ação limpará a aplicação para dados 100% reais do zero.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmReset(false);
                  await clearAllDatabaseData();
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all"
              >
                Confirmar e Zerar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

