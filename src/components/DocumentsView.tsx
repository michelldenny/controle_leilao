import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { FileText, ExternalLink, Plus, Search, ShieldCheck } from "lucide-react";

export const DocumentsView: React.FC = () => {
  const { items, auctions } = useAuction();
  const [search, setSearch] = useState("");

  // Collect documents from items and auctions
  const allDocs = [
    ...(items || []).flatMap((i) =>
      (i?.documents || []).map((d) => ({ ...d, origin: `Item: ${i.name} (${i.code})` }))
    ),
  ];

  const filteredDocs = allDocs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.origin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Central de Documentos & Laudos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Editais, Notas Fiscais (NFe), Termos de Arrematação, Guias de Pagamento e Laudos Técnicos
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar documento por título, origem, tipo..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {doc.type}
                </span>
                <span className="text-[10px] text-slate-400">{doc.dateUploaded}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.title}</h3>
              <p className="text-slate-400 text-[11px]">{doc.origin}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <span>Visualizar Documento</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
