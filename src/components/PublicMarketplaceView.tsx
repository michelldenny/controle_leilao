import React, { useState, useMemo } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem } from "../types";
import {
  ShoppingBag,
  Search,
  Tag,
  ExternalLink,
  MessageCircle,
  X,
  CheckCircle2,
  Share2,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Store,
  Sparkles,
} from "lucide-react";

import { PRODUCT_CATEGORIES } from "../constants/categories";

export const PublicMarketplaceView: React.FC = () => {
  const { items } = useAuction();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedItemForModal, setSelectedItemForModal] = useState<AuctionItem | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<AuctionItem | null>(null);

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

      return matchesSearch && matchesCategory;
    });
  }, [availableItems, search, selectedCategory]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const handleShareMarketplace = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?mode=vitrine`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem || !buyerName) return;

    const estimatedSalePrice = checkoutItem.estimatedMarketAvg || checkoutItem.listedPrice || 0;
    const marketNewValue = checkoutItem.newProductMarketValue || (estimatedSalePrice > 0 ? Number((estimatedSalePrice / 0.7).toFixed(2)) : 0);
    const discountPct = checkoutItem.discountPercentage || (marketNewValue > estimatedSalePrice && marketNewValue > 0 ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);

    const message =
      `🛒 *NOVO PEDIDO VIA VITRINE VIRTUAL*\n\n` +
      `📦 *Produto:* ${checkoutItem.name}\n` +
      `🏷️ *Código:* ${checkoutItem.code}\n` +
      (marketNewValue > 0 ? `📊 *Valor Mercado (Novo):* ${formatCurrency(marketNewValue)}\n` : "") +
      `💰 *Valor de Venda:* ${formatCurrency(estimatedSalePrice)}\n` +
      (discountPct > 0 ? `🔥 *Desconto Aplicado:* ${discountPct}% OFF\n` : "") +
      `📍 *Condição:* ${checkoutItem.condition.toUpperCase()}\n\n` +
      `👤 *Dados do Cliente:*\n` +
      `- *Nome:* ${buyerName}\n` +
      (buyerPhone ? `- *Telefone/WhatsApp:* ${buyerPhone}\n` : "") +
      (buyerNotes ? `- *Observações:* ${buyerNotes}\n` : "") +
      `\nOlá, gostaria de confirmar a disponibilidade e os detalhes para concluir a compra deste bem!`;

    // Número de WhatsApp para onde as mensagens dos clientes serão enviadas diretamente
    const sellerWhatsApp = "5513988091839"; // Substitua pelo seu número com DDD (ex: 5511999999999)
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner Publico */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>Vitrine de Oportunidades</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Leilão & Arrematações
                </span>
              </h1>
              <p className="text-xs text-slate-400">Bens Arrematados com Descontos Exclusivos</p>
            </div>
          </div>

          <button
            onClick={handleShareMarketplace}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all shrink-0 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartilhar Vitrine</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-8 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Encontre Produtos de Leilão por Preços de Ocasião
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Todos os itens passam por avaliação rigorosa e possuem valores abaixo da tabela de mercado. Faça seu pedido diretamente pelo WhatsApp.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-3xl mx-auto pt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por produto, código, marca, modelo..."
                className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-56 py-3 px-4 text-xs rounded-2xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="todas">Todas as Categorias ({availableItems.length})</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Nenhum produto disponível encontrado</h3>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou selecione uma categoria diferente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => {
              const marketNewValue = item.newProductMarketValue || (item.estimatedMarketAvg > 0 ? Number((item.estimatedMarketAvg / 0.7).toFixed(2)) : item.estimatedMarketAvg);
              const estimatedSalePrice = item.estimatedMarketAvg || item.listedPrice || 0;
              const discountPct = item.discountPercentage || (marketNewValue > estimatedSalePrice ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl bg-slate-800/70 border border-slate-700/70 overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedItemForModal(item)}>
                    <img
                      src={item.primaryPhoto}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {discountPct > 0 && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-black rounded-xl bg-emerald-500 text-slate-950 shadow-lg">
                        -{discountPct}% OFF
                      </span>
                    )}

                    <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-slate-950/80 text-amber-400 backdrop-blur-md border border-slate-700">
                      {item.condition}
                    </span>

                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-slate-950/80 text-slate-300 backdrop-blur-md border border-slate-800">
                      {item.code}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Product info - grows to push prices down */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                        {item.category}
                      </span>
                      <h3
                        onClick={() => setSelectedItemForModal(item)}
                        className="font-bold text-sm text-white hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
                      >
                        {item.name}
                      </h3>
                      {(item.brand || item.model) && (
                        <p className="text-xs text-slate-400 truncate font-medium">
                          {item.brand} {item.model}
                        </p>
                      )}
                    </div>

                    {/* Spacer to push prices to bottom */}
                    <div className="flex-1" />

                    {/* Standardized Prices Breakdown - always at bottom */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-left mt-3">
                      {marketNewValue > 0 && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Valor Mercado:</span>
                          <span className="text-slate-400 line-through font-semibold">
                            {formatCurrency(marketNewValue)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Valor de Venda:</span>
                        <span className="text-lg font-black text-emerald-400">
                          {formatCurrency(estimatedSalePrice)}
                        </span>
                      </div>

                      {discountPct > 0 && (
                        <div className="text-[10px] text-right text-amber-400 font-bold">
                          Desconto Aplicado: {discountPct}% OFF
                        </div>
                      )}
                    </div>

                    {/* Actions - always at very bottom */}
                    <div className="space-y-2 pt-3">
                      <button
                        onClick={() => setCheckoutItem(item)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-slate-950" />
                        <span>Comprar via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setSelectedItemForModal(item)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
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

      {/* Modal Detalhes do Produto */}
      {selectedItemForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          onClick={() => setSelectedItemForModal(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  {selectedItemForModal.category} • Código: {selectedItemForModal.code}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedItemForModal.name}</h2>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Carousel/Gallery */}
            <div className="space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedItemForModal.primaryPhoto}
                  alt={selectedItemForModal.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedItemForModal.photos && selectedItemForModal.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {selectedItemForModal.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 cursor-pointer hover:border-amber-500"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Specs & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Condição Física:</span>
                <span className="font-bold text-white uppercase">{selectedItemForModal.condition}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Estado Operacional:</span>
                <span className="font-bold text-white uppercase">{selectedItemForModal.operationalState.replace("_", " ")}</span>
              </div>
              {selectedItemForModal.brand && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Marca:</span>
                  <span className="font-bold text-white">{selectedItemForModal.brand}</span>
                </div>
              )}
              {selectedItemForModal.model && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Modelo:</span>
                  <span className="font-bold text-white">{selectedItemForModal.model}</span>
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
                    <span className="text-xs text-slate-400 block font-semibold">Valor de Venda</span>
                    <div className="text-2xl font-black text-emerald-400">
                      {formatCurrency(estimatedSalePrice)}
                    </div>
                    {marketNewValue > estimatedSalePrice && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="line-through">Valor Mercado: {formatCurrency(marketNewValue)}</span>
                        {discountPct > 0 && (
                          <span className="px-2 py-0.5 font-bold rounded bg-amber-500/20 text-amber-400 text-[10px]">
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950" />
                    <span>Tenho Interesse / Comprar</span>
                  </button>
                </div>
              );
            })()}

            {/* Description / Notes */}
            {selectedItemForModal.description && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-300 block">Observações do Produto:</span>
                <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          onClick={() => setCheckoutItem(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Finalizar Pedido via WhatsApp</h3>
              </div>
              <button onClick={() => setCheckoutItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <img
                src={checkoutItem.primaryPhoto}
                alt={checkoutItem.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="space-y-0.5 truncate">
                <span className="font-mono text-[10px] font-bold text-amber-400 block">
                  {checkoutItem.code}
                </span>
                <h4 className="font-bold text-white truncate">{checkoutItem.name}</h4>
                <div className="text-emerald-400 font-extrabold">
                  {formatCurrency(checkoutItem.listedPrice || checkoutItem.estimatedMarketAvg || 0)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSendWhatsAppOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Seu Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Observações / Dúvidas</label>
                <textarea
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Pergunte sobre frete, agendamento de retirada ou estado do produto..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
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
