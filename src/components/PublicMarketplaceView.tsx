import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem } from "../types";
import {
  ShoppingBag,
  Search,
  Tag,
  MessageCircle,
  X,
  CheckCircle2,
  Share2,
  Info,
  Store,
  Sparkles,
  Edit3,
  Award,
  Filter,
} from "lucide-react";

import { PRODUCT_CATEGORIES } from "../constants/categories";
import { ITEM_SEALS, ITEM_SEALS_LIST, ItemSealId } from "../constants/seals";

export const PublicMarketplaceView: React.FC = () => {
  const { items, updateItem } = useAuction();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedSealFilter, setSelectedSealFilter] = useState<string>("todos");
  const [selectedItemForModal, setSelectedItemForModal] = useState<AuctionItem | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<AuctionItem | null>(null);
  const [editingSealItem, setEditingSealItem] = useState<AuctionItem | null>(null);

  // Form State do envio WhatsApp
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Apenas itens "disponiveis" ou "anunciados" que estejam ativos e não descartados/uso próprio
  const availableItems = useMemo(() => {
    return items.filter(
      (i) => (i.status === "disponivel" || i.status === "anunciado") && !i.archived
    );
  }, [items]);

  // Filtros
  const filteredItems = useMemo(() => {
    return availableItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        (item.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.model || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "todas" || item.category === selectedCategory;

      const matchesSeal =
        selectedSealFilter === "todos" || item.seal === selectedSealFilter;

      return matchesSearch && matchesCategory && matchesSeal;
    });
  }, [availableItems, search, selectedCategory, selectedSealFilter]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const handleShareMarketplace = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?mode=vitrine`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSelectSeal = (itemId: string, sealId: ItemSealId) => {
    updateItem(itemId, { seal: sealId });
    if (selectedItemForModal && selectedItemForModal.id === itemId) {
      setSelectedItemForModal((prev) => (prev ? { ...prev, seal: sealId } : null));
    }
    setEditingSealItem(null);
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem || !buyerName) return;

    const estimatedSalePrice = checkoutItem.estimatedMarketAvg || checkoutItem.listedPrice || 0;
    const marketNewValue = checkoutItem.newProductMarketValue || (estimatedSalePrice > 0 ? Number((estimatedSalePrice / 0.7).toFixed(2)) : 0);
    const discountPct = checkoutItem.discountPercentage || (marketNewValue > estimatedSalePrice && marketNewValue > 0 ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);
    const sealObj = checkoutItem.seal ? ITEM_SEALS[checkoutItem.seal] : null;

    const message =
      `🛒 *NOVO PEDIDO VIA VITRINE VIRTUAL*\n\n` +
      `📦 *Produto:* ${checkoutItem.name}\n` +
      `🏷️ *Código:* ${checkoutItem.code}\n` +
      (sealObj ? `🏷️ *Selo de Qualidade:* ${sealObj.emoji} ${sealObj.name} - ${sealObj.description}\n` : "") +
      (marketNewValue > 0 ? `📊 *Valor Mercado (Novo):* ${formatCurrency(marketNewValue)}\n` : "") +
      `💰 *Valor de Venda:* ${formatCurrency(estimatedSalePrice)}\n` +
      (discountPct > 0 ? `🔥 *Desconto Aplicado:* ${discountPct}% OFF\n` : "") +
      `📍 *Condição:* ${checkoutItem.condition.toUpperCase()}\n\n` +
      `👤 *Dados do Cliente:*\n` +
      `- *Nome:* ${buyerName}\n` +
      (buyerPhone ? `- *Telefone/WhatsApp:* ${buyerPhone}\n` : "") +
      (buyerNotes ? `- *Observações:* ${buyerNotes}\n` : "") +
      `\nOlá, gostaria de confirmar a disponibilidade e os detalhes para concluir a compra deste bem!`;

    const sellerWhatsApp = "5513988091839";
    const cleanPhone = sellerWhatsApp.replace(/\D/g, "");

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    setCheckoutItem(null);
    setBuyerName("");
    setBuyerPhone("");
    setBuyerNotes("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner Publico Light */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>Vitrine de Oportunidades</span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Leilão & Arrematações
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Bens Arrematados com Descontos Exclusivos</p>
            </div>
          </div>

          <button
            onClick={handleShareMarketplace}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-extrabold">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-600" />
                <span>Compartilhar Vitrine</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section Light */}
      <section className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-slate-50 py-10 px-4 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Oportunidades Únicas de Leilão
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Encontre Produtos de Leilão por Preços de Ocasião
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            Todos os itens passam por avaliação rigorosa, possuem classificação por selos de garantia estético-funcionais e valores abaixo da tabela de mercado.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-4xl mx-auto pt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por produto, código, marca, modelo..."
                className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-52 py-3 px-4 text-xs rounded-2xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-bold shadow-sm"
            >
              <option value="todas">Todas Categorias ({availableItems.length})</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedSealFilter}
              onChange={(e) => setSelectedSealFilter(e.target.value)}
              className="w-full sm:w-52 py-3 px-4 text-xs rounded-2xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-bold shadow-sm"
            >
              <option value="todos">Todos os Selos</option>
              {ITEM_SEALS_LIST.map((seal) => (
                <option key={seal.id} value={seal.id}>
                  {seal.emoji} {seal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Guia Legenda dos Selos (Accordion ou badges explicativos) */}
          <div className="pt-4 max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
            {ITEM_SEALS_LIST.map((seal) => (
              <span
                key={seal.id}
                title={seal.description}
                onClick={() => setSelectedSealFilter(selectedSealFilter === seal.id ? "todos" : seal.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${seal.badgeBgClass} ${seal.badgeTextClass} ${seal.badgeBorderClass} ${selectedSealFilter === seal.id ? "ring-2 ring-amber-500" : "opacity-90 hover:opacity-100"}`}
              >
                <span>{seal.emoji}</span>
                <span>{seal.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Nenhum produto disponível encontrado</h3>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou limpe os filtros de categoria/selo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => {
              const marketNewValue = item.newProductMarketValue || (item.estimatedMarketAvg > 0 ? Number((item.estimatedMarketAvg / 0.7).toFixed(2)) : item.estimatedMarketAvg);
              const estimatedSalePrice = item.estimatedMarketAvg || item.listedPrice || 0;
              const discountPct = item.discountPercentage || (marketNewValue > estimatedSalePrice ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);
              const seal = item.seal ? ITEM_SEALS[item.seal] : null;

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 group overflow-hidden"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedItemForModal(item)}>
                    <img
                      src={item.primaryPhoto}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {discountPct > 0 && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-black rounded-xl bg-emerald-600 text-white shadow-md">
                        -{discountPct}% OFF
                      </span>
                    )}

                    {/* Selo Badge ou Botão Editar Selo */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {seal ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSealItem(item);
                          }}
                          title={`${seal.description} (Clique para alterar o selo)`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-full border shadow-md cursor-pointer ${seal.badgeBgClass} ${seal.badgeTextClass} ${seal.badgeBorderClass} hover:scale-105 transition-transform`}
                        >
                          <span>{seal.emoji}</span>
                          <span>{seal.name}</span>
                          <Edit3 className="w-3 h-3 ml-0.5 opacity-70" />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSealItem(item);
                          }}
                          className="px-2 py-1 text-[10px] font-bold rounded-full bg-white/90 text-amber-800 border border-amber-300 shadow-md backdrop-blur-sm hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>+ Escolher Selo</span>
                        </button>
                      )}
                    </div>

                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-white/90 text-slate-700 backdrop-blur-md border border-slate-200 shadow-xs">
                      {item.code}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          {item.condition}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedItemForModal(item)}
                        className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
                      >
                        {item.name}
                      </h3>

                      {(item.brand || item.model) && (
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {item.brand} {item.model}
                        </p>
                      )}

                      {/* Seal info text snippet */}
                      {seal && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2 font-medium line-clamp-2">
                          <span className="font-bold not-italic">{seal.emoji} {seal.name}:</span> {seal.description}
                        </p>
                      )}
                    </div>

                    {/* Standardized Prices Breakdown */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left mt-3">
                      {marketNewValue > 0 && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-medium">Valor Mercado:</span>
                          <span className="text-slate-500 line-through font-semibold">
                            {formatCurrency(marketNewValue)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-800">Valor de Venda:</span>
                        <span className="text-lg font-black text-emerald-700">
                          {formatCurrency(estimatedSalePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-3">
                      <button
                        onClick={() => setCheckoutItem(item)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Comprar via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setSelectedItemForModal(item)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ver Detalhes do Produto</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Seleção/Edição de Selos */}
      {editingSealItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setEditingSealItem(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">Escolha o Selo do Produto</h3>
              </div>
              <button
                onClick={() => setEditingSealItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Selecione o selo de estado estético/funcional para <strong>{editingSealItem.name}</strong> ({editingSealItem.code}):
            </p>

            <div className="space-y-2">
              {ITEM_SEALS_LIST.map((seal) => {
                const isSelected = editingSealItem.seal === seal.id;
                return (
                  <div
                    key={seal.id}
                    onClick={() => handleSelectSeal(editingSealItem.id, seal.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${seal.badgeBgClass} ${seal.badgeBorderClass} hover:ring-2 hover:ring-amber-500 ${isSelected ? "ring-2 ring-amber-600 font-bold" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{seal.emoji}</span>
                      <div>
                        <div className={`text-xs font-black ${seal.badgeTextClass}`}>
                          {seal.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium leading-tight">
                          {seal.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Produto */}
      {selectedItemForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setSelectedItemForModal(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  {selectedItemForModal.category} • Código: {selectedItemForModal.code}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedItemForModal.name}</h2>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos & Seal Banner */}
            <div className="space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedItemForModal.primaryPhoto}
                  alt={selectedItemForModal.name}
                  className="w-full h-full object-cover"
                />

                {selectedItemForModal.seal && (
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ITEM_SEALS[selectedItemForModal.seal].emoji}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Selo {ITEM_SEALS[selectedItemForModal.seal].name}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {ITEM_SEALS[selectedItemForModal.seal].description}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSealItem(selectedItemForModal)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                    >
                      Alterar Selo
                    </button>
                  </div>
                )}
              </div>

              {selectedItemForModal.photos && selectedItemForModal.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {selectedItemForModal.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:border-amber-500"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Specs & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium">
              <div>
                <span className="text-slate-500 block mb-0.5">Condição Física:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedItemForModal.condition}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Estado Operacional:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedItemForModal.operationalState.replace("_", " ")}</span>
              </div>
              {selectedItemForModal.brand && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Marca:</span>
                  <span className="font-bold text-slate-900">{selectedItemForModal.brand}</span>
                </div>
              )}
              {selectedItemForModal.model && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Modelo:</span>
                  <span className="font-bold text-slate-900">{selectedItemForModal.model}</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            {(() => {
              const marketNewValue = selectedItemForModal.newProductMarketValue || (selectedItemForModal.estimatedMarketAvg > 0 ? Number((selectedItemForModal.estimatedMarketAvg / 0.7).toFixed(2)) : selectedItemForModal.estimatedMarketAvg);
              const estimatedSalePrice = selectedItemForModal.estimatedMarketAvg || selectedItemForModal.listedPrice || 0;
              const discountPct = selectedItemForModal.discountPercentage || (marketNewValue > estimatedSalePrice ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 block font-bold">Valor de Venda</span>
                    <div className="text-2xl font-black text-emerald-700">
                      {formatCurrency(estimatedSalePrice)}
                    </div>
                    {marketNewValue > estimatedSalePrice && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="line-through font-semibold">Valor Mercado: {formatCurrency(marketNewValue)}</span>
                        {discountPct > 0 && (
                          <span className="px-2 py-0.5 font-bold rounded bg-amber-100 text-amber-800 text-[10px] border border-amber-300">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutItem(selectedItemForModal);
                      setSelectedItemForModal(null);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Tenho Interesse / Comprar</span>
                  </button>
                </div>
              );
            })()}

            {/* Description / Notes */}
            {selectedItemForModal.description && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800 block">Observações do Produto:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                  {selectedItemForModal.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Checkout WhatsApp */}
      {checkoutItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setCheckoutItem(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Finalizar Pedido via WhatsApp</h3>
              </div>
              <button onClick={() => setCheckoutItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <img
                src={checkoutItem.primaryPhoto}
                alt={checkoutItem.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-0.5 truncate">
                <span className="font-mono text-[10px] font-bold text-amber-700 block">
                  {checkoutItem.code}
                </span>
                <h4 className="font-bold text-slate-900 truncate">{checkoutItem.name}</h4>
                <div className="text-emerald-700 font-extrabold">
                  {formatCurrency(checkoutItem.listedPrice || checkoutItem.estimatedMarketAvg || 0)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSendWhatsAppOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Seu Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Observações / Dúvidas</label>
                <textarea
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Pergunte sobre frete, agendamento de retirada ou estado do produto..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar para WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
