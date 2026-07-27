import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { Auction, AuctionStatus } from "../types";
import {
  Gavel,
  Plus,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  FileText,
  Boxes,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";

export const AuctionsView: React.FC = () => {
  const { auctions, addAuction, updateAuction, deleteAuction, lots, items, setActiveTab } = useAuction();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [auctioneer, setAuctioneer] = useState("");
  const [platform, setPlatform] = useState("");
  const [processNumber, setProcessNumber] = useState("");
  const [responsibleEntity, setResponsibleEntity] = useState("");
  const [auctionType, setAuctionType] = useState("Judicial");
  const [auctionDate, setAuctionDate] = useState("2026-08-15");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [pickupAddress, setPickupAddress] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState(5);
  const [editalUrl, setEditalUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AuctionStatus>("participando");

  const handleOpenEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setName(auction.name);
    setAuctioneer(auction.auctioneer);
    setPlatform(auction.platform || "");
    setProcessNumber(auction.processNumber || "");
    setResponsibleEntity(auction.responsibleEntity || "");
    setAuctionType(auction.auctionType || "Judicial");
    setAuctionDate(auction.auctionDate || "2026-08-15");
    setCity(auction.city || "São Paulo");
    setState(auction.state || "SP");
    setPickupAddress(auction.pickupAddress || "");
    setCommissionPercentage(auction.commissionPercentage || 5);
    setEditalUrl(auction.editalUrl || "");
    setNotes(auction.notes || "");
    setStatus(auction.status || "participando");
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingAuction(null);
    setName("");
    setAuctioneer("");
    setPlatform("");
    setProcessNumber("");
    setResponsibleEntity("");
    setAuctionType("Judicial");
    setAuctionDate("2026-08-15");
    setCity("São Paulo");
    setState("SP");
    setPickupAddress("");
    setCommissionPercentage(5);
    setEditalUrl("");
    setNotes("");
    setStatus("participando");
    setIsModalOpen(true);
  };

  const handleDeleteAuction = (id: string, aucName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o leilão "${aucName}"?`)) {
      deleteAuction(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !auctioneer) return;

    if (editingAuction) {
      updateAuction(editingAuction.id, {
        name,
        auctioneer,
        platform: platform || auctioneer,
        processNumber,
        responsibleEntity,
        auctionType,
        auctionDate,
        city,
        state,
        pickupAddress,
        commissionPercentage: Number(commissionPercentage),
        editalUrl,
        notes,
        status,
      });
    } else {
      addAuction({
        name,
        auctioneer,
        platform: platform || auctioneer,
        processNumber,
        responsibleEntity,
        auctionType,
        auctionDate,
        city,
        state,
        pickupAddress,
        commissionPercentage: Number(commissionPercentage),
        editalUrl,
        notes,
        status,
        documentsCount: 1,
      });
    }

    setIsModalOpen(false);
    setEditingAuction(null);
  };

  const filteredAuctions = auctions.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.auctioneer.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBadgeColor = (st: AuctionStatus) => {
    switch (st) {
      case "concluido":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "participando":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "futuro":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "cancelado":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-500" />
            <span>Módulo de Leilões</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastro de pregões judiciais, extrajudiciais e corporativos com edital e documentos anexados
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Leilão</span>
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
            placeholder="Pesquisar leilão por nome, leiloeiro, cidade..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="todos">Todos</option>
            <option value="participando">Participando</option>
            <option value="futuro">Futuro</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Grid of Auctions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auc) => {
          const aucLots = lots.filter((l) => l.auctionId === auc.id);
          const aucItems = items.filter((i) => i.auctionId === auc.id);

          return (
            <div
              key={auc.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getBadgeColor(
                      auc.status
                    )}`}
                  >
                    {auc.status}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(auc)}
                      title="Editar leilão"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAuction(auc.id, auc.name)}
                      title="Excluir leilão"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {auc.name}
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    {auc.auctioneer} • {auc.platform}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Data: {new Date(auc.auctionDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{auc.city} - {auc.state}</span>
                  </div>
                  {auc.processNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px] text-slate-500 font-mono">Processo: {auc.processNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-amber-500" />
                    <span>{aucLots.length} lotes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>{aucItems.length} itens</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAuction(auc)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>Detalhes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Auction Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-500" />
                <span>{editingAuction ? "Editar Leilão" : "Cadastrar Novo Leilão"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Leilão *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Leilão Judicial TRT-2 - Ativos de TI"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leiloeiro Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    value={auctioneer}
                    onChange={(e) => setAuctioneer(e.target.value)}
                    placeholder="Ex: Sodré Santoro, Superbid, Frazão"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plataforma / Site
                  </label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="Ex: Superbid Exchange"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número do Processo (se houver)
                  </label>
                  <input
                    type="text"
                    value={processNumber}
                    onChange={(e) => setProcessNumber(e.target.value)}
                    placeholder="Ex: 0001234-88.2024.5.02.0002"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Órgão / Empresa Responsável
                  </label>
                  <input
                    type="text"
                    value={responsibleEntity}
                    onChange={(e) => setResponsibleEntity(e.target.value)}
                    placeholder="Ex: TRT da 2ª Região / Caixa Econômica"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Leilão
                  </label>
                  <select
                    value={auctionType}
                    onChange={(e) => setAuctionType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Judicial">Judicial</option>
                    <option value="Extrajudicial">Extrajudicial</option>
                    <option value="Corporativo">Corporativo / Frota</option>
                    <option value="Público / Orgão">Público / Orgão</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data do Leilão
                  </label>
                  <input
                    type="date"
                    value={auctionDate}
                    onChange={(e) => setAuctionDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Comissão do Leiloeiro (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AuctionStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="participando">Participando</option>
                    <option value="futuro">Futuro</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Endereço para Retirada dos Bens
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Ex: Av. do Estado, 4500 - Mooca, São Paulo - SP"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL do Edital
                  </label>
                  <input
                    type="url"
                    value={editalUrl}
                    onChange={(e) => setEditalUrl(e.target.value)}
                    placeholder="https://site.com.br/edital.pdf"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Salvar Leilão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auction Detail Modal */}
      {selectedAuction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedAuction(null)}
        >
          <div
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedAuction.name}
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {selectedAuction.auctioneer} • {selectedAuction.platform}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Informações Principais</h4>
                <p><strong>Tipo:</strong> {selectedAuction.auctionType}</p>
                <p><strong>Data:</strong> {new Date(selectedAuction.auctionDate).toLocaleDateString("pt-BR")}</p>
                <p><strong>Comissão:</strong> {selectedAuction.commissionPercentage}%</p>
                <p><strong>Processo:</strong> {selectedAuction.processNumber || "N/A"}</p>
                <p><strong>Órgão:</strong> {selectedAuction.responsibleEntity || "N/A"}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Logística de Retirada</h4>
                <p><strong>Cidade/UF:</strong> {selectedAuction.city} - {selectedAuction.state}</p>
                <p><strong>Endereço:</strong> {selectedAuction.pickupAddress || "Não informado"}</p>
                {selectedAuction.editalUrl && (
                  <a
                    href={selectedAuction.editalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold underline mt-1"
                  >
                    <span>Acessar Edital Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedAuction(null);
                  setActiveTab("lots");
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                Ver Lotes Deste Leilão &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
