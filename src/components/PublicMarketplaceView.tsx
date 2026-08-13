import React, { useMemo, useState, useRef } from "react";
import { ArrowRight, Armchair, Boxes, Car, CheckSquare, CircleUserRound, Clock3, Dumbbell, Gavel, Home, Laptop, Menu, MessageCircle, Package, Search, ShieldCheck, Shirt, ShoppingBag, Smartphone, Sparkles, Tag, Truck, Tv, Wrench, X } from "lucide-react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem } from "../types";
import { ITEM_SEALS, ItemSealId } from "../constants/seals";

import stepCuration from "../../assets/step_curation.png";
import stepEvaluation from "../../assets/step_evaluation.png";
import stepOffer from "../../assets/step_offer.png";
import stepDelivery from "../../assets/step_delivery.png";
import logoOutletWm from "../../assets/logo_outlet_wm.jpg";

type Page = "home" | "categories" | "how";
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const price = (i: AuctionItem) => i.estimatedMarketAvg || i.listedPrice || 0;
const market = (i: AuctionItem) => {
  if (i.newProductMarketValue && i.newProductMarketValue > 0) return i.newProductMarketValue;
  const p = price(i);
  if (p > 0) return Number((p / 0.7).toFixed(2));
  return 0;
};
const discount = (i: AuctionItem) => {
  if (i.discountPercentage && i.discountPercentage > 0) return i.discountPercentage;
  const m = market(i);
  const p = price(i);
  if (m > p && m > 0) return Math.round(((m - p) / m) * 100);
  return 30;
};

function getCategoryIcon(cat: string) {
  const c = (cat || "").toLowerCase();
  if (c.includes("eletrôn") || c.includes("tv") || c.includes("áudio") || c.includes("video")) return <Tv />;
  if (c.includes("celular") || c.includes("telef") || c.includes("smartphone")) return <Smartphone />;
  if (c.includes("informá") || c.includes("comput") || c.includes("notebook") || c.includes("laptop")) return <Laptop />;
  if (c.includes("móve") || c.includes("casa") || c.includes("decora") || c.includes("sofá")) return <Armchair />;
  if (c.includes("moda") || c.includes("roupa") || c.includes("vestu")) return <Shirt />;
  if (c.includes("esport") || c.includes("fitness") || c.includes("lazer")) return <Dumbbell />;
  if (c.includes("auto") || c.includes("veíc") || c.includes("carro")) return <Car />;
  if (c.includes("ferramen") || c.includes("maquin") || c.includes("obra")) return <Wrench />;
  if (c.includes("eletrodom") || c.includes("cozinha")) return <Sparkles />;
  if (c.includes("brinquedo") || c.includes("infantil") || c.includes("bebê")) return <ShoppingBag />;
  if (c.includes("beleza") || c.includes("saúde") || c.includes("cosmét")) return <Tag />;
  if (c.includes("livro") || c.includes("papelaria") || c.includes("escritór")) return <Package />;
  return <Boxes />;
}

function getSealBadge(item: AuctionItem) {
  const s = item.seal || (item.condition === "novo" ? "prime" : item.condition === "seminovo" ? "excelente" : "bom");
  const sealObj = ITEM_SEALS[s as ItemSealId];
  const emojiMap: Record<string, string> = {
    prime: "🟣",
    premium: "🟢",
    excelente: "🔵",
    muito_bom: "🟡",
    bom: "🟠",
    oportunidade: "🔴"
  };
  const labelMap: Record<string, string> = {
    prime: "Prime",
    premium: "Premium",
    excelente: "Excelente",
    muito_bom: "Muito Bom",
    bom: "Bom",
    oportunidade: "Oportunidade"
  };
  const emoji = sealObj?.emoji || emojiMap[s] || "🏷️";
  const label = sealObj?.name || labelMap[s] || "WM";
  return <span className={`ow-seal-badge ow-seal-${s}`}>{emoji} {label}</span>;
}

function Logo() {
  return (
    <span className="ow-logo" style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
      <img
        src={logoOutletWm}
        alt="Outlet WM Logo"
        style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover", border: "2px solid #fd9d1a" }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <strong style={{ fontSize: "20px", color: "#001736", fontWeight: 800, lineHeight: 1.1 }}>Outlet WM</strong>
        <span style={{ fontSize: "11px", color: "#43474f", fontWeight: 500, letterSpacing: "-0.01em" }}>
          produtos de qualidade por preços de oportunidade
        </span>
      </div>
    </span>
  );
}

function RulesAndWarrantySection() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      background: "#ffffff",
      padding: "32px",
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05)"
    }}>
      {/* CARD REGRAS */}
      <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#92400e", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          ⚠️ Regras
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#78350f", fontSize: "14px", lineHeight: "1.5" }}>
          <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: "#d97706", fontWeight: "bold" }}>•</span>
            Produtos são vendidos por ordem de pagamento.
          </li>
          <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: "#d97706", fontWeight: "bold" }}>•</span>
            Não realizamos reservas sem pagamento.
          </li>
          <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: "#d97706", fontWeight: "bold" }}>•</span>
            As fotos e vídeos publicados são sempre do produto real.
          </li>
          <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: "#d97706", fontWeight: "bold" }}>•</span>
            Todos os detalhes estéticos e funcionais são informados no anúncio.
          </li>
          <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: "#d97706", fontWeight: "bold" }}>•</span>
            Caso tenha qualquer dúvida, fale conosco antes de finalizar a compra.
          </li>
        </ul>
      </div>

      {/* CARD GARANTIA */}
      <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#166534", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          🛡️ Garantia
        </h3>
        <p style={{ color: "#15803d", fontWeight: 600, fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
          Todos os produtos possuem 7 dias de garantia contra defeitos de funcionamento não informados no anúncio.
        </p>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          A garantia não cobre:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
            ❌ Mau uso
          </div>
          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
            ❌ Quedas
          </div>
          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
            ❌ Danos após entrega
          </div>
          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
            ❌ Arrependimento
          </div>
        </div>
        <div style={{ padding: "10px 14px", background: "#dcfce7", borderRadius: "10px", color: "#14532d", fontWeight: 700, fontSize: "13px", textAlign: "center", marginTop: "auto" }}>
          Nosso compromisso é sempre vender exatamente aquilo que foi anunciado.
        </div>
      </div>

      {/* CARD FACILIDADES NO PAGAMENTO */}
      <div style={{ background: "#eff6ff", border: "1px solid #dbeafe", padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1e40af", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          💳 Facilidades no pagamento
        </h3>
        <p style={{ color: "#1e3a8a", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
          Gostou? Não precisa pagar tudo de uma vez.
        </p>
        <p style={{ color: "#1d4ed8", fontSize: "13.5px", lineHeight: "1.45", marginBottom: "16px" }}>
          No Outlet WM, você pode parcelar suas compras no cartão de crédito e escolher a condição que melhor se encaixa no seu orçamento.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", display: "flex", flexDirection: "column", gap: "8px", color: "#1e40af", fontSize: "13.5px", fontWeight: 600 }}>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            💳 Pagamento parcelado no cartão
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            ⚡ PIX para pagamento à vista
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            📲 Consulte as condições de parcelamento
          </li>
        </ul>
        <div style={{ padding: "10px 14px", background: "#dbeafe", borderRadius: "10px", color: "#1e3a8a", fontWeight: 700, fontSize: "12.5px", textAlign: "center", marginTop: "auto" }}>
          Mais facilidade para você aproveitar nossas oportunidades sem abrir mão do seu orçamento.
        </div>
      </div>
    </div>
  );
}

export const PublicMarketplaceView: React.FC = () => {
  const { items } = useAuction();
  const [page, setPage] = useState<Page>("home");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<AuctionItem | null>(null);

  const products = useMemo(() => items.filter(i => i.status === "disponivel" && !i.archived), [items]);
  const featuredProducts = useMemo(() => {
    return products.filter(i => Boolean(i.isFeatured));
  }, [products]);

  const categories = useMemo(() => Array.from(new Set(products.map(i => i.category).filter(Boolean))).sort((a: string, b: string) => a.localeCompare(b, "pt-BR")), [products]);

  const toggleCategory = (cat: string) => {
    if (cat === "Todos") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const shown = useMemo(() => products.filter(i => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const text = [i.name, i.code, i.category, i.subcategory, i.brand, i.model, i.description].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(i.category);
    const matchesSearch = !term || text.includes(term);
    return matchesCat && matchesSearch;
  }), [products, selectedCategories, query]);

  const go = (p: Page) => { setPage(p); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goCategory = (c: string) => { setSelectedCategories([c]); go("categories"); };
  const whatsapp = (i?: AuctionItem) => window.open(`https://wa.me/5513988091839?text=${encodeURIComponent(i ? `Olá! Tenho interesse no produto ${i.name} (${i.code}), por ${money(price(i))}.` : "Olá! Quero conhecer os produtos disponíveis da Outlet WM.")}`, "_blank", "noopener,noreferrer");

  return <div className="ow-site">
    <header className="ow-header"><div className="ow-container ow-header-inner"><button onClick={() => go("home")} aria-label="Início"><Logo /></button><nav className={menu ? "ow-nav open" : "ow-nav"}><button className={page === "home" ? "active" : ""} onClick={() => go("home")}>Home</button><button className={page === "categories" ? "active" : ""} onClick={() => go("categories")}>Vitrine</button><button className={page === "how" ? "active" : ""} onClick={() => go("how")}>Como Funciona</button><button onClick={() => whatsapp()}>Meus Lances</button></nav><div className="ow-actions"><CircleUserRound /><button className="ow-menu" onClick={() => setMenu(v => !v)} aria-label="Abrir menu">{menu ? <X /> : <Menu />}</button></div></div></header>

    {/* HOME */}
    {page === "home" && <main><section className="ow-hero"><div className="ow-container ow-hero-grid"><div className="ow-hero-copy"><span className="ow-kicker"><i /> Produtos disponíveis</span><h1><em>Outlet WM.</em><br />Oportunidades Inteligentes.</h1><p>Descubra itens de alto valor por uma fração do preço. Produtos selecionados, informações transparentes e oportunidades reais para comprar melhor.</p><div className="ow-cta-row"><button className="ow-primary" onClick={() => go("categories")}>Ver Vitrine Agora <ArrowRight /></button><button className="ow-secondary" onClick={() => go("how")}>Como Funciona</button></div></div><div className="ow-metric"><div><b>Inventário disponível</b><strong>Atualizado</strong></div><div className="ow-chart"><i /><i /><i /><i /><i /><i /></div><hr /><small>Produtos ativos</small><h2>{products.length.toLocaleString("pt-BR")}</h2><span>↻</span></div></div></section>

      {/* FAIXA DINÂMICA DE CATEGORIAS COM ÍCONES ESPECÍFICOS */}
      {categories.length > 0 && (
        <div className="ow-category-strip">
          <div className="ow-category-marquee">
            {[...categories, ...categories, ...categories].map((c, idx) => (
              <button key={`${c}-${idx}`} onClick={() => goCategory(c)}>
                {getCategoryIcon(c)}{c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE DESTAQUES DINÂMICOS */}
      <section className="ow-container ow-featured">
        <div className="ow-section-head">
          <div>
            <h2>Destaques disponíveis</h2>
            <p>Produtos selecionados do inventário em destaque especial.</p>
          </div>
          <button onClick={() => go("categories")}>Ver Toda a Vitrine <ArrowRight /></button>
        </div>

        {featuredProducts.length ? (
          <FeaturedMarquee
            items={featuredProducts}
            onSelect={(i) => setSelected(i)}
            onContact={(i) => whatsapp(i)}
          />
        ) : <Empty />}
      </section>
    </main>}

    {/* VITRINE (CATEGORIAS) */}
    {page === "categories" && <main className="ow-container ow-categories-page">
      <div className="ow-title-row">
        <div>
          <h1>Vitrine Outlet WM</h1>
          <p>Consulte os produtos disponíveis por categoria, nome, marca, modelo ou selo de qualidade.</p>
        </div>
      </div>

      <div className="ow-catalog">
        <aside>
          <h2>Categorias</h2>
          <button onClick={() => toggleCategory("Todos")}>
            <i className={selectedCategories.length === 0 ? "checked" : ""} />
            <strong>Todas as Categorias</strong>
            <span>{products.length}</span>
          </button>
          {categories.map(c => {
            const isChecked = selectedCategories.includes(c);
            const count = products.filter(i => i.category === c).length;
            return (
              <button key={c} onClick={() => toggleCategory(c)}>
                <i className={isChecked ? "checked" : ""} />
                {c}
                <span>{count}</span>
              </button>
            );
          })}
        </aside>

        <div>
          {/* CAMPO DE BUSCA LARGURA TOTAL COM BOTÃO X */}
          <div className="ow-search" style={{ marginBottom: "24px" }}>
            <Search size={18} style={{ color: "#64748b" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar na vitrine por nome, selo, marca, modelo..."
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ border: 0, background: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: "4px" }}
                aria-label="Apagar busca"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {shown.length ? (
            <div className="ow-products">
              {shown.map(i => <Card key={i.id} item={i} details={() => setSelected(i)} contact={() => whatsapp(i)} />)}
            </div>
          ) : <Empty />}
        </div>
      </div>
    </main>}

    {/* COMO FUNCIONA */}
    {page === "how" && <main><section className="ow-container ow-how"><div className="ow-how-intro"><h1>Logística Reversa,<br /><span>Descomplicada.</span></h1><p>Transformamos retornos, excessos de estoque e devoluções em oportunidades de alto valor. Nosso processo garante transparência, qualidade e agilidade.</p></div><div className="ow-steps">{[[Package, "Curadoria", "Selecionamos produtos de logística reversa de grandes varejistas e marcas. Cada lote passa por uma curadoria cuidadosa, buscando produtos com bom potencial de uso e excelente custo-benefício.", stepCuration], [CheckSquare, "Avaliação", "Cada produto é inspecionado e avaliado pelo padrão Outlet WM em quatro critérios: funcionamento, aparência, acessórios e embalagem. Ao final, recebe um selo que representa sua condição.", stepEvaluation], [Gavel, "Oferta", "Após avaliação e higienização, os produtos são catalogados e oferecidos por valores abaixo do mercado, com descontos que podem variar de 30% a 90%, conforme sua condição e selo de qualidade.", stepOffer], [Truck, "Entrega", "Após a confirmação da compra, combinamos a opção mais conveniente para ambas as partes. O produto pode ser entregue no endereço do comprador, retirado no local ou de outra forma combinada.", stepDelivery]].map(([Icon, title, text, image]: any, n) => <article key={title} style={{ display: "flex", flexDirection: "column", height: "100%" }}><div className={n === 2 ? "accent" : ""}><Icon /></div><h2>{title}</h2><p style={{ flexGrow: 1, marginBottom: "20px" }}>{text}</p><div style={{ width: "100%", height: "260px", background: "#f8fafc", borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={image} alt={title} className="ow-step-image" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div></article>)}</div></section>

      {/* REGRAS E GARANTIA (COMO FUNCIONA) */}
      <section className="ow-container" style={{ margin: "40px auto 60px" }}>
        <RulesAndWarrantySection />
      </section>

      <section className="ow-final-cta"><h2>Pronto para encontrar sua<br />próxima grande oportunidade?</h2><p>Explore agora os produtos disponíveis no inventário Outlet WM.</p><button className="ow-primary" onClick={() => go("categories")}>Explorar Ofertas <ArrowRight /></button></section></main>}

    {/* SEÇÃO GLOBAL DE REGRAS E GARANTIA (HOME & VITRINE) */}
    {page !== "how" && (
      <section className="ow-container" style={{ margin: "60px auto 40px" }}>
        <RulesAndWarrantySection />
      </section>
    )}

    <Footer go={go} />
    <nav className="ow-bottom">
      <button onClick={() => go("home")} className={page === "home" ? "active" : ""}>
        <Home />Home
      </button>
      <button onClick={() => go("categories")} className={page === "categories" ? "active" : ""}>
        <Boxes />Vitrine
      </button>
      <button onClick={() => go("how")} className={page === "how" ? "active" : ""}>
        <CheckSquare />Como Funciona
      </button>
      <button onClick={() => whatsapp()}>
        <MessageCircle />Contato
      </button>
    </nav>
    {selected && <div className="ow-modal" onClick={() => setSelected(null)}><div onClick={e => e.stopPropagation()}><button className="ow-modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button><img src={selected.primaryPhoto} alt={selected.name} />{discount(selected) > 0 && <span style={{ background: "#16a34a", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>-{discount(selected)}% OFF</span>}<div style={{ marginTop: "8px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>{getSealBadge(selected)}<small style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>{selected.category}</small></div><h2>{selected.name}</h2><p>{selected.description || "Produto revisado e disponível para venda."}</p>{market(selected) > price(selected) && <del>Mercado: {money(market(selected))}</del>}<strong>{money(price(selected))}</strong><div className="ow-trust"><ShieldCheck /> {selected.condition.replaceAll("_", " ")} <Truck /> {selected.location.customText || "Consulte a entrega"}</div>

      <div style={{ marginTop: "10px", padding: "10px 12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#334155", textAlign: "left" }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>⚠️</span> Regras & Garantia
        </div>
        <ul style={{ margin: 0, paddingLeft: "16px", lineHeight: "1.35" }}>
          <li>Vendas por ordem de pagamento.</li>
          <li><strong>7 dias de garantia</strong> contra defeitos não informados.</li>
        </ul>
      </div>

      <button className="ow-primary" style={{ marginTop: "12px", height: "42px" }} onClick={() => whatsapp(selected)}><MessageCircle /> Enviar interesse via WhatsApp</button></div></div>}
  </div>;
};

function FeaturedMarquee({ items, onSelect, onContact }: { items: AuctionItem[]; onSelect: (i: AuctionItem) => void; onContact: (i: AuctionItem) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.touches[0].pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown.current || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current);
    if (Math.abs(walk) > 8) {
      isDragging.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDown.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="ow-featured-marquee-container"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="ow-featured-marquee">
        {[...items, ...items].map((i, idx) => (
          <Card
            key={`${i.id}-${idx}`}
            item={i}
            details={() => {
              if (!isDragging.current) onSelect(i);
            }}
            contact={() => onContact(i)}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ item, details, contact }: { item: AuctionItem; details: () => void; contact: () => void; key?: React.Key }) {
  const d = discount(item);
  const m = market(item);
  const p = price(item);

  return (
    <article className="ow-card" onClick={details} style={{ cursor: "pointer" }}>
      <div className="ow-card-image">
        <img src={item.primaryPhoto} alt={item.name} />
        {d > 0 && <b style={{ background: "#16a34a", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>-{d}% OFF</b>}
      </div>
      <div className="ow-card-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px", marginBottom: "8px" }}>
          {getSealBadge(item)}
          <small style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.category}
          </small>
        </div>
        <h3>{item.name}</h3>
        {m > p && <del>Mercado: {money(m)}</del>}
        <strong>{money(p)}</strong>
        <div>
          <button onClick={(e) => { e.stopPropagation(); details(); }}>Ver Detalhes</button>
          <button aria-label="Comprar pelo WhatsApp" onClick={(e) => { e.stopPropagation(); contact(); }}><MessageCircle /></button>
        </div>
      </div>
    </article>
  );
}
function Empty() { return <div className="ow-empty"><Boxes /><h3>Nenhum produto disponível</h3><p>Quando um item receber o status “disponível” no inventário, ele aparecerá automaticamente aqui.</p></div>; }
function Footer({ go }: { go: (p: Page) => void }) { return <footer className="ow-footer"><div className="ow-container"><div><Logo /><p>Produtos de qualidade por preços de oportunidade.</p></div><div><b>Navegação</b><button onClick={() => go("home")}>Home</button><button onClick={() => go("categories")}>Vitrine</button><button onClick={() => go("how")}>Como Funciona</button></div><div><b>Suporte</b><span>FAQ</span><span>Termos de Uso</span><span>Privacidade</span></div></div><p>© 2026 Outlet WM Logistics. Todos os direitos reservados.</p></footer>; }
export default PublicMarketplaceView;
