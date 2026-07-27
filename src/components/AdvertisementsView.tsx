import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { Megaphone, ExternalLink, Sparkles, Search, Plus, Eye, MessageSquare } from "lucide-react";

export const AdvertisementsView: React.FC = () => {
  const { items, openItemDetail, openAiModal } = useAuction();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("todas");

  // Gather all ads from all items
  const allAds = (items || []).flatMap((it) =>
    (it?.advertisements || []).map((ad) => ({ ...ad, item: it }))
  );

  const filteredAds = allAds.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.item.name.toLowerCase().includes(search.toLowerCase()) ||
      ad.platform.toLowerCase().includes(search.toLowerCase());
    const matchesPlat = platformFilter === "todas" || ad.platform === platformFilter;
    return matchesSearch && matchesPlat;
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            <span>Controle de Anúncios nos Marketplaces</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe a divulgação no Mercado Livre, OLX, Webmotors e Facebook Marketplace
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar anúncio por título, item ou plataforma..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="todas">Todas as Plataformas</option>
          <option value="Mercado Livre">Mercado Livre</option>
          <option value="OLX">OLX</option>
          <option value="Webmotors">Webmotors</option>
          <option value="Facebook Marketplace">Facebook Marketplace</option>
        </select>
      </div>

      {/* Ads List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <div
            key={ad.id}
            className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {ad.platform}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {ad.datePublished}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {ad.title}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  Item Origem: {ad.item.name} ({ad.item.code})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Preço de Anúncio</span>
                  <strong className="text-sm font-extrabold text-emerald-600">
                    {formatCurrency(ad.price)}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Visualizações / Leads</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {ad.viewsCount} / {ad.leadsCount}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => openAiModal(ad.item)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otimizar Copy por IA</span>
              </button>

              {ad.url && (
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Ver Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
