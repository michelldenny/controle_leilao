import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { PRODUCT_CATEGORIES, ProductCategory } from "../constants/categories";
import { ItemCondition, OperationalState } from "../types";
import {
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

export interface ParsedDraftItem {
  id: string;
  name: string;
  quantity: number;
  category: ProductCategory;
  brand?: string;
  model?: string;
  condition: ItemCondition;
  operationalState: OperationalState;
  estimatedMarketAvg?: number;
}

const CATEGORY_KEYWORDS: { category: ProductCategory; keywords: string[] }[] = [
  {
    category: "Eletrônicos & TI",
    keywords: ["notebook", "computador", "laptop", "pc", "desktop", "servidor", "switch", "roteador", "impressora", "scanner", "nobreak", "estabilizador"],
  },
  {
    category: "Informática & Acessórios",
    keywords: ["teclado", "mouse", "monitor", "headset", "mousepad", "webcam", "gabinete", "memoria", "ssd", "hd", "placa", "cabo", "fonte"],
  },
  {
    category: "Smartphones & Celulares",
    keywords: ["smartphone", "celular", "iphone", "samsung", "motorola", "xiaomi", "redmi", "galaxy", "ipad", "tablet"],
  },
  {
    category: "Audio, Som & Vídeo",
    keywords: ["televisao", "tv", "smart tv", "som", "caixa de som", "fone", "projetor", "amplificador", "receiver", "microfone", "camera", "dvd"],
  },
  {
    category: "Eletrodomésticos",
    keywords: ["geladeira", "refrigerador", "fogao", "microondas", "micro-ondas", "lavadora", "maquina de lavar", "secadora", "ar condicionado", "freezer", "ventilador", "purificador", "aspirador", "liquidificador", "batedeira", "airfryer", "fritadeira", "cafeteira"],
  },
  {
    category: "Móveis & Escritório",
    keywords: ["cadeira", "mesa", "armario", "estante", "gaveteiro", "sofa", "poltrona", "arquivo", "balcao", "estacao de trabalho", "rack", "escrivaninha"],
  },
  {
    category: "Ferramentas Elétricas & Manuais",
    keywords: ["furadeira", "parafusadeira", "serra", "esmerilhadeira", "martelete", "compressor", "gerador", "alicate", "chave", "trena", "solda", "maçarico"],
  },
  {
    category: "Veículos & Automotivo",
    keywords: ["carro", "moto", "motocicleta", "caminhao", "van", "pneu", "roda", "reboque", "carreta", "trator", "quadriciclo"],
  },
  {
    category: "Máquinas & Equipamentos",
    keywords: ["torno", "fresa", "empilhadeira", "paleteira", "prensa", "injetora", "caldeira", "motor", "bomba", "esteira", "industrial"],
  },
  {
    category: "Game, Consoles & Acessórios",
    keywords: ["playstation", "ps4", "ps5", "xbox", "nintendo", "switch", "game", "console", "joystick", "controle"],
  },
  {
    category: "Itens para Casa",
    keywords: ["panela", "louca", "talheres", "utensilio", "tapete", "cortina", "espelho"],
  },
];

function detectCategory(text: string): ProductCategory {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const item of CATEGORY_KEYWORDS) {
    for (const kw of item.keywords) {
      const cleanKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(cleanKw)) {
        return item.category;
      }
    }
  }
  return "Diversos";
}

function parseTextLines(rawText: string): ParsedDraftItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#") && !l.startsWith("//"));

  const results: ParsedDraftItem[] = [];

  for (const line of lines) {
    let cleanLine = line.replace(/^[-*•\d+.)\]]+\s*/, "").trim();
    if (!cleanLine) continue;

    let qty = 1;
    // Padrões de quantidade: "3x", "03x", "10 un", "10 pcs", "Lote com 5", "5x "
    const qtyMatchPrefix = cleanLine.match(/^(\d+)\s*(x|un|unid|unidades|pcs|pecas|peças|itens)?\s*[-–:]?\s*/i);
    const lotMatch = cleanLine.match(/^(lote\s+com|kit\s+com|conjunto\s+de)\s*(\d+)\s*(itens|pecas|peças|unidades)?\s*[-–:]?\s*/i);

    if (lotMatch) {
      qty = parseInt(lotMatch[2], 10) || 1;
      cleanLine = cleanLine.slice(lotMatch[0].length).trim();
    } else if (qtyMatchPrefix) {
      const parsedQty = parseInt(qtyMatchPrefix[1], 10);
      if (parsedQty > 0 && parsedQty < 1000) {
        qty = parsedQty;
        cleanLine = cleanLine.slice(qtyMatchPrefix[0].length).trim();
      }
    }

    if (!cleanLine) continue;

    const category = detectCategory(cleanLine);

    results.push({
      id: "draft-" + Math.random().toString(36).substring(2, 9),
      name: cleanLine,
      quantity: Math.max(1, qty),
      category,
      condition: "usado",
      operationalState: "funcionando",
      estimatedMarketAvg: 0,
    });
  }

  return results;
}

export const QuickPasteModal: React.FC = () => {
  const {
    isQuickPasteOpen,
    setIsQuickPasteOpen,
    lots,
    auctions,
    addMultipleItems,
    addToast,
  } = useAuction();

  const [rawText, setRawText] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");
  const [draftItems, setDraftItems] = useState<ParsedDraftItem[]>([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [locationText, setLocationText] = useState("apê Michell");
  const [expandQuantities, setExpandQuantities] = useState(true);

  if (!isQuickPasteOpen) return null;

  const currentLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const targetAuctionId = currentLot?.auctionId || auctions[0]?.id || "";

  const handleParseOffline = () => {
    if (!rawText.trim()) {
      addToast("Atenção", "Cole a lista de itens no campo de texto.", "warning");
      return;
    }
    const parsed = parseTextLines(rawText);
    if (parsed.length === 0) {
      addToast("Atenção", "Nenhum item válido identificado no texto.", "warning");
      return;
    }
    setDraftItems(parsed);
    setStep("preview");
    addToast("Lista Processada", `${parsed.length} itens/grupos identificados!`, "info");
  };

  const handleParseWithAi = async () => {
    if (!rawText.trim()) {
      addToast("Atenção", "Cole a lista de itens no campo de texto.", "warning");
      return;
    }

    setIsProcessingAi(true);

    try {
      const response = await fetch("/api/ai/parse-item-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: rawText,
          categories: PRODUCT_CATEGORIES,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na API: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const mapped: ParsedDraftItem[] = data.items.map((it: any) => ({
          id: "draft-" + Math.random().toString(36).substring(2, 9),
          name: it.name || "Item sem nome",
          quantity: Number(it.quantity) || 1,
          category: (PRODUCT_CATEGORIES as readonly string[]).includes(it.category)
            ? it.category
            : detectCategory(it.name || ""),
          brand: it.brand || undefined,
          model: it.model || undefined,
          condition: it.condition || "usado",
          operationalState: it.operationalState || "funcionando",
          estimatedMarketAvg: Number(it.estimatedMarketAvg) || 0,
        }));
        setDraftItems(mapped);
        setStep("preview");
        addToast("IA Concluída", `${mapped.length} itens classificados com sucesso!`, "success");
      } else {
        throw new Error("Resposta da IA vazia.");
      }
    } catch (err: any) {
      // Fallback gracioso para modo offline automático
      console.warn("IA indisponível ou sem chave configurada, usando parser offline automático:", err);
      const parsed = parseTextLines(rawText);
      setDraftItems(parsed);
      setStep("preview");
      addToast(
        "Modo Local / Offline Ativado",
        `${parsed.length} itens processados instantaneamente pelo algoritmo local.`,
        "info"
      );
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleRemoveDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateDraftField = (id: string, field: keyof ParsedDraftItem, val: any) => {
    setDraftItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const totalUnitsToCreate = draftItems.reduce(
    (sum, it) => sum + (expandQuantities ? it.quantity : 1),
    0
  );

  const handleConfirmCreation = () => {
    if (draftItems.length === 0) return;
    if (!currentLot) {
      addToast("Atenção", "Cadastre ou selecione um Lote antes de salvar os itens.", "warning");
      return;
    }

    let createdTotal = 0;

    for (const draft of draftItems) {
      const qty = expandQuantities ? Math.max(1, draft.quantity) : 1;
      addMultipleItems({
        auctionId: targetAuctionId,
        lotId: currentLot.id,
        baseName: draft.name,
        category: draft.category,
        condition: draft.condition,
        quantity: qty,
        unitApportionedCost: 0,
        unitEstimatedValue: draft.estimatedMarketAvg || 0,
      });
      createdTotal += qty;
    }

    addToast(
      "Cadastro Rápido Concluído",
      `${createdTotal} itens adicionados com sucesso ao Lote ${currentLot.lotNumber}!`,
      "success"
    );

    setIsQuickPasteOpen(false);
    setRawText("");
    setDraftItems([]);
    setStep("input");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
      onClick={() => setIsQuickPasteOpen(false)}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col space-y-4 cursor-default overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 border border-amber-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Cadastro Rápido por Lista de Itens</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  IA + Offline
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cole a descrição bruta de múltiplos itens e gere cadastros individualizados em lote.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQuickPasteOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Lot Selector Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <Layers className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Vincular ao Lote:
            </span>
            <select
              value={selectedLotId || currentLot?.id || ""}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-amber-500"
            >
              {lots.length === 0 ? (
                <option value="">Nenhum lote cadastrado (crie um lote primeiro)</option>
              ) : (
                lots.map((l) => {
                  const auc = auctions.find((a) => a.id === l.auctionId);
                  return (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} - {l.description || "Sem descrição"} ({auc?.name || "Leilão"})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={expandQuantities}
              onChange={(e) => setExpandQuantities(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-600"
            />
            <span>Desmembrar quantidades em itens únicos (#1, #2...)</span>
          </label>
        </div>

        {/* STEP 1: INPUT DE TEXTO */}
        {step === "input" && (
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Cole a lista de itens (uma linha por item):
              </label>
              <span className="text-[11px] text-slate-400">
                Exemplos aceitos: "3x Monitor Dell 24", "Notebook Lenovo T480", "10 Cadeira giratória"
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Cole aqui sua lista de produtos, por exemplo:\n\n3x Monitor Dell 24" P2419H\nNotebook Lenovo ThinkPad T480 i5 16GB\n5 Cadeira giratória de escritório preta\nLote com 10 Teclados USB Logitech K120\nAr Condicionado Split 12000 BTUs Elgin\nGeladeira Brastemp Frost Free Inox`}
              className="flex-1 min-h-[220px] p-4 text-xs md:text-sm font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 shrink-0">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  O modo <strong>Offline</strong> funciona instantaneamente sem internet. A <strong>IA</strong> detalha categorias e especificações.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleParseOffline}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 text-slate-500" />
                  <span>Interpretar Offline</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingAi}
                  onClick={handleParseWithAi}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Interpretar com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW E AJUSTE ANTES DE SALVAR */}
        {step === "preview" && (
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Pré-visualização dos Itens Identificados:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] border border-amber-500/20">
                  {draftItems.length} tipos de itens • {totalUnitsToCreate} unidades no total
                </span>
              </div>

              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-amber-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voltar ao texto</span>
              </button>
            </div>

            {/* Editable Preview Table */}
            <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-y-auto max-h-[360px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3 w-20 text-center">Qtd</th>
                    <th className="p-3">Nome do Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Condição</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {draftItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateDraftField(item.id, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-14 p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateDraftField(item.id, "name", e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateDraftField(item.id, "category", e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                        >
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={item.condition}
                          onChange={(e) => handleUpdateDraftField(item.id, "condition", e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        >
                          <option value="usado">Usado</option>
                          <option value="novo">Novo</option>
                          <option value="seminovo">Seminovo</option>
                          <option value="avariado">Avariado</option>
                          <option value="sucata">Sucata</option>
                          <option value="nao_testado">Não testado</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveDraftItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Remover este item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Os itens serão criados como <strong>armazenados</strong> e você poderá ratear custos e colocar fotos depois.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreation}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Cadastrar Todos ({totalUnitsToCreate} Unidades)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

