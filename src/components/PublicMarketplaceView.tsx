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
  Award,
  Filter,
  Home,
  Grid,
  Layers,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  UserCheck,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Wrench,
  Car,
  Armchair,
  User,
  Clock
} from "lucide-react";

import { PRODUCT_CATEGORIES } from "../constants/categories";
import { ITEM_SEALS, ITEM_SEALS_LIST, ItemSealId } from "../constants/seals";

import logoOutletWm from "../../assets/logo_outlet_wm.jpg";

type MarketplaceTab = "home" | "categorias" | "como_funciona" | "quem_somos";

export const PublicMarketplaceView: React.FC = () => {
  const { items } = useAuction();

  // Navigation State
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("home");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedSealFilter, setSelectedSealFilter] = useState<string>("todos");
  const [selectedConditionFilter, setSelectedConditionFilter] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<string>("desconto");
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

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem || !buyerName) return;

    const estimatedSalePrice = checkoutItem.estimatedMarketAvg || checkoutItem.listedPrice || 0;
    const marketNewValue = checkoutItem.newProductMarketValue || (estimatedSalePrice > 0 ? Number((estimatedSalePrice / 0.7).toFixed(2)) : 0);
    const discountPct = checkoutItem.discountPercentage || (marketNewValue > estimatedSalePrice && marketNewValue > 0 ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);
    const sealObj = checkoutItem.seal ? ITEM_SEALS[checkoutItem.seal] : null;

    const message =
      `🛒 *NOVO PEDIDO VIA VITRINE - OUTLET WM*\n\n` +
      `📦 *Produto:* ${checkoutItem.name}\n` +
      `🏷️ *Código:* ${checkoutItem.code}\n` +
      (sealObj ? `🏷️ *Selo de Qualidade:* ${sealObj.emoji} ${sealObj.name}\n` : "") +
      (marketNewValue > 0 ? `📊 *Valor Mercado (Novo):* ${formatCurrency(marketNewValue)}\n` : "") +
      `💰 *Valor de Venda:* ${formatCurrency(estimatedSalePrice)}\n` +
      (discountPct > 0 ? `🔥 *Desconto Aplicado:* ${discountPct}% OFF\n` : "") +
      `\n👤 *Dados do Cliente:*\n` +
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

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("informática") || c.includes("computador") || c.includes("notebook")) return <Laptop className="w-6 h-6 text-slate-700" />;
    if (c.includes("smartphone") || c.includes("celular") || c.includes("telefonia")) return <Smartphone className="w-6 h-6 text-slate-700" />;
    if (c.includes("áudio") || c.includes("som") || c.includes("fone")) return <Headphones className="w-6 h-6 text-slate-700" />;
    if (c.includes("eletro") || c.includes("tv") || c.includes("vídeo")) return <Tv className="w-6 h-6 text-slate-700" />;
    if (c.includes("ferramentas")) return <Wrench className="w-6 h-6 text-slate-700" />;
    if (c.includes("automotivo")) return <Car className="w-6 h-6 text-slate-700" />;
    return <Armchair className="w-6 h-6 text-slate-700" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950 pb-24 md:pb-12">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={logoOutletWm}
              alt="Outlet WM Logo"
              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-xs"
            />
            <span className="font-black text-xl text-slate-900 tracking-tight">Outlet WM</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <button onClick={() => setActiveTab("home")} className={`hover:text-slate-900 transition-colors cursor-pointer py-1 ${activeTab === "home" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : ""}`}>Home</button>
            <button onClick={() => setActiveTab("categorias")} className={`hover:text-slate-900 transition-colors cursor-pointer py-1 ${activeTab === "categorias" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : ""}`}>Categorias</button>
            <button onClick={() => setActiveTab("como_funciona")} className={`hover:text-slate-900 transition-colors cursor-pointer py-1 ${activeTab === "como_funciona" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : ""}`}>Como Funciona</button>
            <button onClick={() => setActiveTab("lances")} className={`hover:text-slate-900 transition-colors cursor-pointer py-1 ${activeTab === "lances" ? "text-slate-900 font-extrabold border-b-2 border-slate-900" : ""}`}>Meus Lotes</button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("categorias")} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"><Search className="w-5 h-5" /></button>
            <button onClick={handleShareMarketplace} className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-slate-800 shadow-sm" title="Compartilhar">
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
      {/* ==================== TELA 1: HOME (Fiel às Imagens 1, 2, 3 e 4) ==================== */}
      {activeTab === "home" && (
        <div className="space-y-8">
          {/* Hero Banner Estilo Stitch (Escuro/Navy com Badges e CTA Marrom Ouro) */}
          <section className="max-w-7xl mx-auto px-4 pt-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0A192F] text-white space-y-6 relative overflow-hidden shadow-xl text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B45309]/30 text-amber-300 text-xs font-extrabold border border-amber-500/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Leilões Ativos
              </span>

              <div className="max-w-xl space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Logística Reversa. <br />
                  Oportunidades Inteligentes.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  Encontre lotes de alto valor com descontos exclusivos direto da fonte.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("categorias")}
                  className="px-6 py-3 rounded-xl bg-[#854D0E] hover:bg-[#A16207] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  Ver Ofertas Agora
                </button>
                <button
                  onClick={() => setActiveTab("como_funciona")}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer border border-white/20"
                >
                  Como Funciona
                </button>
              </div>
            </div>
          </section>

          {/* Carrossel de Categorias com Círculos Suaves (Fiel à Imagem 1) */}
          <section className="max-w-7xl mx-auto px-4 text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorias</h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTab("categorias");
                  }}
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-200/70 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                    {getCategoryIcon(cat)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Destaques da Semana - Cards com Tag Vermelha -45% OFF e Botão Marrom (Fiel às Imagens) */}
          <section className="max-w-7xl mx-auto px-4 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Destaques da Semana</h3>
              <button
                onClick={() => setActiveTab("categorias")}
                className="text-xs font-bold uppercase tracking-wider text-[#854D0E] hover:underline cursor-pointer"
              >
                Ver Todos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.slice(0, 8).map((item) => {
                const marketNewValue = item.newProductMarketValue || (item.estimatedMarketAvg > 0 ? Number((item.estimatedMarketAvg / 0.7).toFixed(2)) : item.estimatedMarketAvg);
                const estimatedSalePrice = item.estimatedMarketAvg || item.listedPrice || 0;
                const discountPct = item.discountPercentage || (marketNewValue > estimatedSalePrice ? Math.round(((marketNewValue - estimatedSalePrice) / marketNewValue) * 100) : 0);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    {/* Imagem com Tag de Desconto Retangular Vermelho Vivido */}
                    <div className="relative h-56 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedItemForModal(item)}>
                      <img
                        src={item.primaryPhoto}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      {discountPct > 0 && (
                        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-black rounded-lg bg-[#DC2626] text-white shadow-md">
                          -{discountPct}% OFF
                        </span>
                      )}

                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-xs">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>02h 14m</span>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <h4
                          onClick={() => setSelectedItemForModal(item)}
                          className="font-bold text-sm text-slate-900 hover:text-[#854D0E] transition-colors line-clamp-2 cursor-pointer leading-snug"
                        >
                          Lote {item.code}: {item.name}
                        </h4>

                        {marketNewValue > 0 && (
                          <div className="text-xs text-slate-400 line-through pt-1">
                            Mercado: {formatCurrency(marketNewValue)}
                          </div>
                        )}

                        <div className="text-base font-black text-slate-900">
                          {formatCurrency(estimatedSalePrice)}
                        </div>
                        <span className="text-[10px] text-slate-500 block font-medium">Preço de Venda / Lance Mínimo</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setSelectedItemForModal(item)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title="Ver Detalhes"
                        >
                          <Search className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setCheckoutItem(item)}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#854D0E] hover:bg-[#A16207] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                          Ver Detalhes / Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

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

                    {/* Seal badge display */}
                    {seal && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${seal.badgeBgClass} ${seal.badgeTextClass} ${seal.badgeBorderClass}`}>
                          <span>{seal.emoji}</span>
                          <span>{seal.name}</span>
                        </span>
                      </div>
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

      {/* Modal Checkout WhatsApp */}
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
                      </div>
                    </div>
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
            {(selectedItemForModal.brand || selectedItemForModal.model) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium">
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
            )}

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

      {/* FOOTER PREMIUM COMPLETO (Design Inspirado no Mockup) */}
      <footer className="bg-white border-t border-slate-200 pt-12 pb-24 md:pb-12 text-left mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-3">
                <img src={logoOutletWm} alt="Outlet WM" className="w-10 h-10 rounded-xl object-cover border border-amber-500/40" />
                <span className="font-black text-xl text-slate-900 tracking-tight">OUTLET WM</span>
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Sua plataforma oficial de oportunidades de leilão e logística reversa. Produtos de qualidade por preços de oportunidade.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">Navegação</span>
              <ul className="space-y-1.5 text-slate-600 font-medium">
                <li><button onClick={() => setActiveTab("home")} className="hover:text-amber-700">Home</button></li>
                <li><button onClick={() => setActiveTab("categorias")} className="hover:text-amber-700">Categorias</button></li>
                <li><button onClick={() => setActiveTab("como_funciona")} className="hover:text-amber-700">Como Funciona</button></li>
                <li><button onClick={() => setActiveTab("quem_somos")} className="hover:text-amber-700">Quem Somos</button></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">Atendimento & Suporte</span>
              <ul className="space-y-1.5 text-slate-600 font-medium">
                <li>WhatsApp Comercial: (13) 98809-1839</li>
                <li>Atendimento: Seg a Sex, 09h às 18h</li>
                <li>Garantia & Procedência Auditada</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-4">
            <div>© {new Date().getFullYear()} Outlet WM. Todos os direitos reservados.</div>
            <div className="flex items-center gap-4">
              <span>Termos de Uso</span>
              <span>Privacidade</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVIGATION BAR PARA SMARTPHONES (Design Inspirado nos Protótipos Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors ${
            activeTab === "home" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab("categorias")}
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors ${
            activeTab === "categorias" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Categorias</span>
        </button>

        <button
          onClick={() => setActiveTab("como_funciona")}
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors ${
            activeTab === "como_funciona" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Como Funciona</span>
        </button>

        <button
          onClick={() => setActiveTab("quem_somos")}
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors ${
            activeTab === "quem_somos" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Quem Somos</span>
        </button>
      </div>

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
