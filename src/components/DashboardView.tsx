import React from "react";
import { useAuction } from "../context/AuctionContext";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  Wrench,
  Megaphone,
  AlertCircle,
  Gavel,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export const DashboardView: React.FC = () => {
  const { metrics, items, activityLogs, setIsWizardOpen, openItemDetail, setActiveTab } = useAuction();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  // Mock monthly financial trend data derived from sales and items
  const monthlyData = [
    { month: "Jan", investimentos: 45000, vendas: 28000, lucro: 8200 },
    { month: "Fev", investimentos: 62000, vendas: 51000, lucro: 14500 },
    { month: "Mar", investimentos: 38000, vendas: 42000, lucro: 11200 },
    { month: "Abr", investimentos: 89000, vendas: 64000, lucro: 18900 },
    { month: "Mai", investimentos: 54000, vendas: 72000, lucro: 22400 },
    { month: "Jun", investimentos: 13995, vendas: 3450, lucro: 738 },
    { month: "Jul", investimentos: 136100, vendas: 174900, lucro: 44900 },
  ];

  // Distribution by Status
  const statusCounts = [
    { name: "Disponível", value: metrics.availableItemsCount, color: "#10B981" },
    { name: "Anunciado", value: metrics.advertisedCount, color: "#3B82F6" },
    { name: "Vendido", value: metrics.soldItemsCount, color: "#8B5CF6" },
    { name: "Em Manutenção", value: metrics.inMaintenanceCount, color: "#F59E0B" },
    { name: "Aguard. Retirada", value: metrics.awaitingPickupCount, color: "#EC4899" },
    { name: "Outros / Armazenado", value: Math.max(0, metrics.totalItemsCount - (metrics.availableItemsCount + metrics.advertisedCount + metrics.soldItemsCount + metrics.inMaintenanceCount + metrics.awaitingPickupCount)), color: "#64748B" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Sistema Avançado de Gestão de Patrimônio & Leilões</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral do Portfólio</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Controle do investimento total, valuations de mercado, revenda acelerada e acompanhamento de ROI em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>+ Nova Arrematação (Wizard 8 Etapas)</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid - 12 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <button
          onClick={() => setActiveTab("financial")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Investido</span>
            <DollarSign className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalInvested)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Arrematações + custos adicionais
          </div>
        </button>

        {/* Estimated Market Value */}
        <button
          onClick={() => setActiveTab("inventory")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Valor Estimado de Mercado</span>
            <TrendingUp className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalEstimatedMarket)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Valuation total dos bens</span>
          </div>
        </button>

        {/* Total Sold Amount */}
        <button
          onClick={() => setActiveTab("sales")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Vendido</span>
            <ShoppingBag className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalSoldAmount)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.soldItemsCount} itens comercializados
          </div>
        </button>

        {/* Realized Profit */}
        <button
          onClick={() => setActiveTab("financial")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Lucro Realizado (Líquido)</span>
            <DollarSign className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.realizedProfit)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Líquido após taxas e frete
          </div>
        </button>

        {/* Potential Profit */}
        <button
          onClick={() => setActiveTab("bi")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Lucro Potencial (Estoque)</span>
            <TrendingUp className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics.potentialProfit)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Margem projetada no estoque
          </div>
        </button>

        {/* Total Items */}
        <button
          onClick={() => setActiveTab("inventory")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total de Itens</span>
            <Package className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.totalItemsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Cadastrados em carteira
          </div>
        </button>

        {/* Items Available */}
        <button
          onClick={() => setActiveTab("inventory")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Prontos p/ Venda</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.availableItemsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Testados e armazenados
          </div>
        </button>

        {/* Advertised Items */}
        <button
          onClick={() => setActiveTab("advertisements")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Itens Anunciados</span>
            <Megaphone className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.advertisedCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Nos marketplaces
          </div>
        </button>

        {/* Sold Items */}
        <button
          onClick={() => setActiveTab("sales")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Itens Vendidos</span>
            <ShoppingBag className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.soldItemsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Concluídos com receita
          </div>
        </button>

        {/* Awaiting Pickup */}
        <button
          onClick={() => setActiveTab("lots")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Aguardando Retirada</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.awaitingPickupCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Prazos nos leiloeiros
          </div>
        </button>

        {/* In Maintenance */}
        <button
          onClick={() => setActiveTab("inventory")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Em Manutenção/Reforma</span>
            <Wrench className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.inMaintenanceCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Em conserto ou higienização
          </div>
        </button>

        {/* Unassessed Items */}
        <button
          onClick={() => setActiveTab("inventory")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-red-500/50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Sem Avaliação</span>
            <AlertCircle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {metrics.unassessedCount}
          </div>
          <div className="mt-1 text-[11px] text-red-500 font-medium">
            Requerem pesquisa de preço
          </div>
        </button>
      </div>

      {/* Capital Immobilized Callout Box */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Capital Atualmente Imobilizado em Estoque
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Existem <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(metrics.capitalInInventoryCost)}</strong> investidos em bens ainda não vendidos.
            O valor estimado de mercado desse estoque é <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(metrics.capitalInInventoryEstimated)}</strong>.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("bi")}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors shrink-0"
        >
          Ver Análise de Inteligência (BI)
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investimentos vs Vendas por Mês */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Investimentos x Vendas por Mês (R$)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo de gastos em arrematações vs faturamento mensal
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415515" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `R$ ${v / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), ""]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "none", color: "#FFF" }}
                />
                <Area type="monotone" dataKey="investimentos" name="Investido" stroke="#F59E0B" fillOpacity={1} fill="url(#colorInvest)" strokeWidth={2} />
                <Area type="monotone" dataKey="vendas" name="Vendido" stroke="#10B981" fillOpacity={1} fill="url(#colorVendas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Distribuição por Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Situação atual de todos os itens cadastrados
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val} itens`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700">
            {statusCounts.map((st) => (
              <div key={st.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                <span className="truncate text-slate-600 dark:text-slate-300">{st.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Timeline */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Atividades Recentes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Histórico de vendas, movimentações de localização e alterações de status
            </p>
          </div>
          <button
            onClick={() => setActiveTab("inventory")}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Ver Todo Inventário &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              onClick={() => log.itemId && openItemDetail(log.itemId)}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">
                <Gavel className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{log.title}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{log.description}</p>
                <div className="text-[10px] text-slate-400 font-medium">Por: {log.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
