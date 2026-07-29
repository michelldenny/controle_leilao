import React, { useState, useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import { Sparkles, X, Loader2, DollarSign, Megaphone, TrendingUp, CheckCircle2 } from "lucide-react";

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, aiModalItem, closeAiModal } = useAuction();

  const [mode, setMode] = useState<"analyze" | "ad" | "strategy">("analyze");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form inputs for custom query
  const [itemName, setItemName] = useState(aiModalItem?.name || "Notebook Dell Latitude 5420 i7 16GB");
  const [category, setCategory] = useState(aiModalItem?.category || "Eletrônicos & TI");
  const [condition, setCondition] = useState(aiModalItem?.condition || "usado");
  const [brand, setBrand] = useState(aiModalItem?.brand || "Dell");
  const [model, setModel] = useState(aiModalItem?.model || "Latitude 5420");
  const [realTotalCost, setRealTotalCost] = useState(aiModalItem?.realTotalCost || 850);
  const [platform, setPlatform] = useState("Mercado Livre");

  useEffect(() => {
    if (aiModalItem) {
      setItemName(aiModalItem.name);
      setCategory(aiModalItem.category);
      setCondition(aiModalItem.condition);
      setBrand(aiModalItem.brand || "");
      setModel(aiModalItem.model || "");
      setRealTotalCost(aiModalItem.realTotalCost || 0);
    } else {
      setItemName("Notebook Dell Latitude 5420 i7 16GB");
      setCategory("Eletrônicos & TI");
      setCondition("usado");
      setBrand("Dell");
      setModel("Latitude 5420");
      setRealTotalCost(850);
    }
  }, [aiModalItem]);

  if (!isAiModalOpen) return null;

  const handleRunAi = async () => {
    setLoading(true);
    setResult(null);

    try {
      let endpoint = "/api/ai/analyze-item";
      let bodyData: any = {
        name: itemName,
        category,
        condition,
        brand,
        model,
        realTotalCost,
      };

      if (mode === "ad") {
        endpoint = "/api/ai/generate-ad";
        bodyData = {
          name: itemName,
          category,
          condition,
          brand,
          model,
          platform,
          totalCost: realTotalCost,
          estimatedValue: aiModalItem?.estimatedMarketAvg || realTotalCost * 1.5,
          specs: [],
        };
      } else if (mode === "strategy") {
        endpoint = "/api/ai/pricing-strategy";
        bodyData = {
          name: itemName,
          category,
          condition,
          totalCost: realTotalCost,
          estimatedAvg: aiModalItem?.estimatedMarketAvg || realTotalCost * 1.5,
          daysInStock: aiModalItem?.daysInStock || 10,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errMessage = `Erro HTTP ${res.status}: Servidor indisponível`;
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } else {
          const text = await res.text();
          if (res.status === 404) {
            errMessage = "A chave GEMINI_API_KEY ou a rota de API do Vercel precisa ser configurada nas Variáveis de Ambiente do projeto no Vercel.";
          }
        }
        setResult({ error: errMessage });
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Erro na requisição IA:", err);
      setResult({ error: err.message || "Erro de conexão com o serviço de IA." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={closeAiModal}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Assistente de Inteligência Artificial para Leilões
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                Análise com Gemini AI • Avaliação, Copywriting e Precificação Inteligente
              </p>
            </div>
          </div>

          <button onClick={closeAiModal} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => {
              setMode("analyze");
              setResult(null);
            }}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${
              mode === "analyze"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1. Valoração de Mercado</span>
          </button>

          <button
            onClick={() => {
              setMode("ad");
              setResult(null);
            }}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${
              mode === "ad"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>2. Gerar Anúncio</span>
          </button>

          <button
            onClick={() => {
              setMode("strategy");
              setResult(null);
            }}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${
              mode === "strategy"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Estratégia Preço/Liquidez</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Item a Analisar:
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custo Real Total (R$)
              </label>
              <input
                type="number"
                value={realTotalCost}
                onChange={(e) => setRealTotalCost(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {mode === "ad" && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plataforma
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Mercado Livre">Mercado Livre</option>
                  <option value="OLX">OLX</option>
                  <option value="Webmotors">Webmotors</option>
                  <option value="Facebook Marketplace">Facebook Marketplace</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleRunAi}
            disabled={loading}
            className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando com Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Executar Análise por Inteligência Artificial</span>
              </>
            )}
          </button>
        </div>

        {/* AI Results Output */}
        {result && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3 text-xs animate-in fade-in">
            {result.error ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 space-y-1">
                <strong className="block font-bold">Falha na Requisição de IA</strong>
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resultado da IA:</span>
                </h4>

            {mode === "analyze" && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white dark:bg-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valuation Mínimo</span>
                    <strong className="text-slate-900 dark:text-white">
                      R$ {result.estimatedMarketMin?.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valuation Médio</span>
                    <strong className="text-emerald-600 font-extrabold">
                      R$ {result.estimatedMarketAvg?.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valuation Máximo</span>
                    <strong className="text-slate-900 dark:text-white">
                      R$ {result.estimatedMarketMax?.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Resumo Técnico & Parecer:</span>
                  <p className="text-slate-600 dark:text-slate-300">{result.pricingAdvice || result.summary}</p>
                </div>
              </div>
            )}

            {mode === "ad" && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Título Otimizado (SEO):
                  </span>
                  <p className="font-bold text-amber-600">{result.title || result.optimizedTitle}</p>

                  <span className="font-bold text-slate-900 dark:text-white block pt-2">
                    Descrição Profissional do Anúncio:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {result.description}
                  </p>
                </div>
              </div>
            )}

            {mode === "strategy" && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Recomendação Estratégica:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{result.recommendedAction || result.strategy}</p>
                  
                  {result.marginAnalysis && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pt-1 font-semibold">
                      Análise de Margem: {result.marginAnalysis}
                    </p>
                  )}
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}
    </div>
  </div>
);
};
