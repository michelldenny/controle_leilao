import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem, ItemStatus, AdPlatform } from "../types";
import { EditItemModal } from "./EditItemModal";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Wrench,
  Megaphone,
  FileText,
  Clock,
  Sparkles,
  QrCode,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Gavel,
  Edit,
} from "lucide-react";

interface ItemDetailViewProps {
  itemId: string;
  onBack: () => void;
  onSelectQrCode?: (item: AuctionItem) => void;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ itemId, onBack, onSelectQrCode }) => {
  const {
    items,
    auctions,
    lots,
    updateItem,
    deleteItem,
    openAiModal,
    expenses,
    maintenanceRecords,
    advertisements,
    documents,
    activityLogs,
    addExpense,
    addMaintenance,
    addAdvertisement,
  } = useAuction();

  const [activeTab, setActiveTab] = useState<
    "overview" | "financial" | "maintenance" | "ads" | "documents" | "history"
  >("overview");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Item não encontrado ou foi removido.</p>
        <button onClick={onBack} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
          Voltar ao Inventário
        </button>
      </div>
    );
  }

  const auction = auctions.find((a) => a.id === item.auctionId);
  const lot = lots.find((l) => l.id === item.lotId);

  // Associated collections
  const itemExpenses = (expenses || []).filter((e) => e.itemId === item.id);
  const itemMaintenances = (maintenanceRecords || []).filter((m) => m.itemId === item.id);
  const itemAds = (advertisements || []).filter((a) => a.itemId === item.id);
  const itemDocs = (documents || []).filter((d) => d.entityId === item.id);
  const itemLogs = (activityLogs || []).filter((l) => l.itemId === item.id);

  // Expense form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCost, setExpenseCost] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Manutenção");

  // Maintenance form
  const [showAddMaint, setShowAddMaint] = useState(false);
  const [maintType, setMaintType] = useState("limpeza");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintCost, setMaintCost] = useState("");
  const [maintTech, setMaintTech] = useState("");

  // Ad form
  const [showAddAd, setShowAddAd] = useState(false);
  const [adPlatform, setAdPlatform] = useState<AdPlatform>("Mercado Livre");
  const [adPrice, setAdPrice] = useState(item.listedPrice || item.estimatedMarketAvg);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o item ${item.code} (${item.name})?`)) {
      deleteItem(item.id);
      onBack();
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseCost) return;
    addExpense({
      itemId: item.id,
      description: expenseDesc,
      amount: Number(expenseCost),
      date: new Date().toISOString().split("T")[0],
      category: expenseCategory,
    });
    setShowAddExpense(false);
    setExpenseDesc("");
    setExpenseCost("");
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintDesc) return;
    addMaintenance({
      itemId: item.id,
      serviceType: maintType,
      description: maintDesc,
      cost: Number(maintCost) || 0,
      supplier: maintTech || "Técnico Próprio",
      status: "concluida",
      date: new Date().toISOString().split("T")[0],
      responsible: maintTech || "Técnico Próprio",
    });
    setShowAddMaint(false);
    setMaintDesc("");
    setMaintCost("");
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adPlatform) return;
    addAdvertisement({
      itemId: item.id,
      platform: adPlatform,
      listedPrice: Number(adPrice),
      publishDate: new Date().toISOString().split("T")[0],
      adCost: 0,
      status: "publicado",
    });
    setShowAddAd(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Inventário</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="w-4 h-4 text-amber-500" />
            <span>Editar Item</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Item</span>
          </button>

          <button
            onClick={() => onSelectQrCode && onSelectQrCode(item)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>Etiqueta & QR Code</span>
          </button>

          <button
            onClick={() => openAiModal(item)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Anúncio com IA</span>
          </button>
        </div>
      </div>

      {/* Item Master Summary Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 h-56 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
          <img src={item.primaryPhoto} alt={item.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {item.code}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">{item.category}</span>
            </div>

            <select
              value={item.status}
              onChange={(e) => updateItem(item.id, { status: e.target.value as ItemStatus })}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 border-none cursor-pointer"
            >
              <option value="disponivel">Status: Disponível</option>
              <option value="anunciado">Status: Anunciado</option>
              <option value="vendido">Status: Vendido</option>
              <option value="em_manutencao">Status: Em Manutenção</option>
              <option value="aguardando_retirada">Status: Aguardando Retirada</option>
              <option value="armazenado">Status: Armazenado</option>
            </select>
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {item.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            {item.brand && <span><strong>Marca:</strong> {item.brand}</span>}
            {item.model && <span><strong>Modelo:</strong> {item.model}</span>}
            <span><strong>Condição:</strong> {item.condition}</span>
            <span><strong>Estado Op.:</strong> {item.operationalState}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Gavel className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Arrematado no leilão <strong>{auction?.name || "N/A"}</strong> ({lot?.lotNumber || "Lote"})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Custo Total Real</span>
              <strong className="text-sm text-slate-900 dark:text-white">{formatCurrency(item.realTotalCost)}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Valuation de Mercado</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(item.estimatedMarketAvg)}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Preço Anunciado</span>
              <strong className="text-sm text-blue-600 dark:text-blue-400">
                {formatCurrency(item.listedPrice || 0)}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Lucro Estimado</span>
              <strong className="text-sm text-amber-600 dark:text-amber-400">
                {formatCurrency(item.estimatedMarketAvg - item.realTotalCost)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Visão Geral & Fotos</span>
        </button>

        <button
          onClick={() => setActiveTab("financial")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "financial"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financeiro & DRE</span>
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "maintenance"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Manutenção ({itemMaintenances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ads")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "ads"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Anúncios ({itemAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "documents"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documentos ({itemDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "history"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Histórico ({itemLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Descrição Detalhada</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Galeria de Fotos do Bem ({(item.photos || []).length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(item.photos || []).map((photoUrl, idx) => (
                  <div key={idx} className="h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                    <img src={photoUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Rastreio de Localização Física</span>
              </h3>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white block">{item.location?.customText || "Depósito Central"}</span>
                <p className="text-slate-400 text-[11px]">
                  Armazém: {item.location?.warehouse || "Sede Principal"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCEIRO & DRE */}
      {activeTab === "financial" && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Detalhamento da Composição do Custo Real</h3>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lançar Nova Despesa</span>
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={handleCreateExpense} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                    <input
                      type="text"
                      required
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      placeholder="Ex: Formatação, Frete Local, Peças"
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expenseCost}
                      onChange={(e) => setExpenseCost(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Manutenção">Manutenção / Reparo</option>
                      <option value="Transporte">Transporte / Frete</option>
                      <option value="Limpeza">Limpeza / Higienização</option>
                      <option value="Insumos">Insumos / Embalagem</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-3 py-1.5 text-slate-500 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl">
                    Salvar Despesa
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">Componente / Categoria</th>
                    <th className="p-3">Data</th>
                    <th className="p-3 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Custo Rateado Origem do Lote</td>
                    <td className="p-3 text-slate-400">{item.dateAdded}</td>
                    <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(item.apportionedCost)}</td>
                  </tr>
                  {itemExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {exp.description} <span className="text-[10px] text-slate-400 font-normal">({exp.category})</span>
                      </td>
                      <td className="p-3 text-slate-400">{exp.date}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400">
                    <td className="p-3" colSpan={2}>CUSTO TOTAL REAL ACUMULADO</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.realTotalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANUTENÇÃO & REFORMA */}
      {activeTab === "maintenance" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Registros de Limpeza, Testes & Consertos</h3>
            <button
              onClick={() => setShowAddMaint(!showAddMaint)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Registrar Manutenção</span>
            </button>
          </div>

          {showAddMaint && (
            <form onSubmit={handleCreateMaintenance} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Serviço</label>
                  <input
                    type="text"
                    required
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    placeholder="Ex: Formatação, Pintura, Troca de Tela"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintCost}
                    onChange={(e) => setMaintCost(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    placeholder="Detalhes dos procedimentos executados"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddMaint(false)} className="px-3 py-1.5 text-slate-500 font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Salvar Registro
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {itemMaintenances.length === 0 ? (
              <p className="text-slate-400 p-4 text-center">Nenhum registro de manutenção cadastrado.</p>
            ) : (
              itemMaintenances.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {m.serviceType}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{m.description}</h4>
                    <p className="text-[11px] text-slate-400">Prestador: {m.supplier || "Técnico Próprio"} • Data: {m.date}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Custo</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(m.cost)}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ANÚNCIOS */}
      {activeTab === "ads" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Anúncios Publicados em Marketplaces</h3>
            <button
              onClick={() => setShowAddAd(!showAddAd)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Anúncio</span>
            </button>
          </div>

          {showAddAd && (
            <form onSubmit={handleCreateAd} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plataforma</label>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value as AdPlatform)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="OLX">OLX</option>
                    <option value="Facebook Marketplace">Facebook Marketplace</option>
                    <option value="Webmotors">Webmotors</option>
                    <option value="Shopee">Shopee</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Loja própria">Loja Própria</option>
                    <option value="Venda direta">Venda Direta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preço Anunciado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adPrice}
                    onChange={(e) => setAdPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddAd(false)} className="px-3 py-1.5 text-slate-500 font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Salvar Anúncio
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {itemAds.length === 0 ? (
              <p className="text-slate-400 p-4 text-center">Nenhum anúncio registrado para este item.</p>
            ) : (
              itemAds.map((ad) => (
                <div key={ad.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {ad.platform}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">Publicado em: {ad.publishDate}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(ad.listedPrice)}</span>
                    {ad.url && (
                      <a href={ad.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold underline">
                        <span>Ver Anúncio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTOS */}
      {activeTab === "documents" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Documentos & Laudos Técnicos</h3>
          {itemDocs.length === 0 ? (
            <p className="text-slate-400 py-2">Nenhum documento anexado para este item.</p>
          ) : (
            itemDocs.map((doc) => (
              <div key={doc.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white">{doc.title}</span>
                </div>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-amber-600 font-semibold underline">
                    Visualizar PDF
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: HISTÓRICO */}
      {activeTab === "history" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trilha de Auditoria & Alterações</h3>
          <div className="space-y-3">
            {itemLogs.length === 0 ? (
              <p className="text-slate-400 py-2">Nenhum registro de histórico.</p>
            ) : (
              itemLogs.map((h) => (
                <div key={h.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{h.title}</span>
                    <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                  </div>
                  <p className="text-slate-500">{h.description}</p>
                  <div className="text-[10px] text-slate-400">Por: {h.user}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal para Edição do Item */}
      <EditItemModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
