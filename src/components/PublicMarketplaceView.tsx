import React, { useMemo, useState } from "react";
import { ArrowRight, Armchair, Boxes, Car, CheckSquare, CircleUserRound, Clock3, Dumbbell, Gavel, Home, Laptop, Menu, MessageCircle, Package, Search, ShieldCheck, Shirt, ShoppingBag, Smartphone, Sparkles, Tag, Truck, Tv, Wrench, X } from "lucide-react";
import { useAuction } from "../context/AuctionContext";
import { AuctionItem } from "../types";

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
  const labels: Record<string, string> = {
    prime: "Prime",
    premium: "Premium",
    excelente: "Excelente",
    muito_bom: "Muito Bom",
    bom: "Bom",
    oportunidade: "Oportunidade"
  };
  const label = labels[s] || "WM";
  return <span className={`ow-seal-badge ow-seal-${s}`}>{label}</span>;
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

export const PublicMarketplaceView: React.FC = () => {
  const { items } = useAuction();
  const [page, setPage] = useState<Page>("home");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<AuctionItem | null>(null);

  const products = useMemo(() => items.filter(i => i.status === "disponivel" && !i.archived), [items]);
  const featuredProducts = useMemo(() => {
    const feat = products.filter(i => i.isFeatured);
    return feat.length > 0 ? feat : products;
  }, [products]);

  const categories = useMemo(() => Array.from(new Set(products.map(i => i.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);

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
    <header className="ow-header"><div className="ow-container ow-header-inner"><button onClick={() => go("home")} aria-label="Início"><Logo /></button><nav className={menu ? "ow-nav open" : "ow-nav"}><button className={page === "home" ? "active" : ""} onClick={() => go("home")}>Home</button><button className={page === "categories" ? "active" : ""} onClick={() => go("categories")}>Vitrine</button><button className={page === "how" ? "active" : ""} onClick={() => go("how")}>Como Funciona</button><button onClick={() => whatsapp()}>Meus Lances</button></nav><div className="ow-actions"><Search /><CircleUserRound /><button className="ow-menu" onClick={() => setMenu(v => !v)} aria-label="Abrir menu">{menu ? <X /> : <Menu />}</button></div></div></header>

    {/* HOME */}
    {page === "home" && <main><section className="ow-hero"><div className="ow-container ow-hero-grid"><div className="ow-hero-copy"><span className="ow-kicker"><i /> Produtos disponíveis</span><h1><em>Logística Reversa.</em><br />Oportunidades Inteligentes.</h1><p>Descubra itens de alto valor por uma fração do preço. Produtos selecionados, informações transparentes e oportunidades reais para comprar melhor.</p><div className="ow-cta-row"><button className="ow-primary" onClick={() => go("categories")}>Ver Vitrine Agora <ArrowRight /></button><button className="ow-secondary" onClick={() => go("how")}>Como Funciona</button></div></div><div className="ow-metric"><div><b>Inventário disponível</b><strong>Atualizado</strong></div><div className="ow-chart"><i /><i /><i /><i /><i /><i /></div><hr /><small>Produtos ativos</small><h2>{products.length.toLocaleString("pt-BR")}</h2><span>↻</span></div></div></section>
      
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
          <div className="ow-featured-marquee-container">
            <div className="ow-featured-marquee">
              {[...featuredProducts, ...featuredProducts].map((i, idx) => (
                <Card key={`${i.id}-${idx}`} item={i} details={() => setSelected(i)} contact={() => whatsapp(i)} />
              ))}
            </div>
          </div>
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
    {page === "how" && <main><section className="ow-container ow-how"><div className="ow-how-intro"><h1>Logística Reversa,<br /><span>Descomplicada.</span></h1><p>Transformamos retornos, excessos de estoque e devoluções em oportunidades de alto valor. Nosso processo garante transparência, qualidade e agilidade.</p></div><div className="ow-steps">{[[Package, "Curadoria", "Selecionamos produtos de logística reversa de grandes varejistas e marcas. Cada lote passa por uma curadoria cuidadosa, buscando produtos com bom potencial de uso e excelente custo-benefício.", stepCuration], [CheckSquare, "Avaliação", "Cada produto é inspecionado e avaliado pelo padrão Outlet WM em quatro critérios: funcionamento, aparência, acessórios e embalagem. Ao final, recebe um selo que representa sua condição.", stepEvaluation], [Gavel, "Oferta", "Após avaliação e higienização, os produtos são catalogados e oferecidos por valores abaixo do mercado, com descontos que podem variar de 30% a 90%, conforme sua condição e selo de qualidade.", stepOffer], [Truck, "Entrega", "Após a confirmação da compra, combinamos a opção mais conveniente para ambas as partes. O produto pode ser entregue no endereço do comprador, retirado no local ou de outra forma combinada.", stepDelivery]].map(([Icon, title, text, image]: any, n) => <article key={title} style={{ display: "flex", flexDirection: "column", height: "100%" }}><div className={n === 2 ? "accent" : ""}><Icon /></div><h2>{title}</h2><p style={{ flexGrow: 1, marginBottom: "32px" }}>{text}</p><img src={image} alt={title} className="ow-step-image" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "14px", marginTop: "auto", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} /></article>)}</div></section><section className="ow-final-cta"><h2>Pronto para encontrar sua<br />próxima grande oportunidade?</h2><p>Explore agora os produtos disponíveis no inventário Outlet WM.</p><button className="ow-primary" onClick={() => go("categories")}>Explorar Ofertas <ArrowRight /></button></section></main>}

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
    {selected && <div className="ow-modal" onClick={() => setSelected(null)}><div onClick={e => e.stopPropagation()}><button className="ow-modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button><img src={selected.primaryPhoto} alt={selected.name} />{discount(selected) > 0 && <span style={{ background: "#16a34a", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>-{discount(selected)}% OFF</span>}<div style={{ marginTop: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>{getSealBadge(selected)}<small>{selected.category}</small></div><h2>{selected.name}</h2><p>{selected.description || "Produto revisado e disponível para venda."}</p>{market(selected) > price(selected) && <del>Mercado: {money(market(selected))}</del>}<strong>{money(price(selected))}</strong><div className="ow-trust"><ShieldCheck /> {selected.condition.replaceAll("_", " ")} <Truck /> {selected.location.customText || "Consulte a entrega"}</div><button className="ow-primary" onClick={() => whatsapp(selected)}><MessageCircle /> Enviar interesse via WhatsApp</button></div></div>}
  </div>;
};

function Card({ item, details, contact }: { item: AuctionItem; details: () => void; contact: () => void }) {
  const d = discount(item);
  const m = market(item);
  const p = price(item);

  return (
    <article className="ow-card">
      <div className="ow-card-image">
        <img src={item.primaryPhoto} alt={item.name} />
        {d > 0 && <b style={{ background: "#16a34a", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>-{d}% OFF</b>}
      </div>
      <div className="ow-card-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          {getSealBadge(item)}
          <small style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {item.category}
          </small>
        </div>
        <h3>{item.name}</h3>
        {m > p && <del>Mercado: {money(m)}</del>}
        <strong>{money(p)}</strong>
        <div>
          <button onClick={details}>Ver Detalhes</button>
          <button aria-label="Comprar pelo WhatsApp" onClick={contact}><MessageCircle /></button>
        </div>
      </div>
    </article>
  );
}
function Empty() { return <div className="ow-empty"><Boxes /><h3>Nenhum produto disponível</h3><p>Quando um item receber o status “disponível” no inventário, ele aparecerá automaticamente aqui.</p></div>; }
function Footer({ go }: { go: (p: Page) => void }) { return <footer className="ow-footer"><div className="ow-container"><div><Logo /><p>Produtos de qualidade por preços de oportunidade.</p></div><div><b>Navegação</b><button onClick={() => go("home")}>Home</button><button onClick={() => go("categories")}>Vitrine</button><button onClick={() => go("how")}>Como Funciona</button></div><div><b>Suporte</b><span>FAQ</span><span>Termos de Uso</span><span>Privacidade</span></div></div><p>© 2026 Outlet WM Logistics. Todos os direitos reservados.</p></footer>; }
export default PublicMarketplaceView;
