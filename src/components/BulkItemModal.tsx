import React, { useState, useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import { PRODUCT_CATEGORIES } from "../constants/categories";
import { PackagePlus, X, Check } from "lucide-react";

export const BulkItemModal: React.FC = () => {
  const { isBulkModalOpen, setIsBulkModalOpen, lots, auctions, addMultipleItems } = useAuction();

  const [lotId, setLotId] = useState(lots[0]?.id || "");
  const [baseName, setBaseName] = useState("Notebook Dell Latitude 5420");
  const [category, setCategory] = useState("Eletrônicos & TI");
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(800);
  const [unitEstimatedValue, setUnitEstimatedValue] = useState(2200);
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800");

  useEffect(() => {
    if (lots.length > 0 && !lotId) {
      setLotId(lots[0].id);
    }
  }, [lots, lotId]);

  if (!isBulkModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseName || quantity <= 0) return;

    const targetLot = lots.find((l) => l.id === lotId) || lots[0];

    addMultipleItems({
      auctionId: targetLot?.auctionId || auctions[0]?.id || "auc_1",
      lotId: targetLot?.id || lotId || "lot_1",
      baseName,
      category,
      condition: "usado",
      quantity: Number(quantity),
      unitApportionedCost: Number(unitCost),
      unitEstimatedValue: Number(unitEstimatedValue),
      photoUrl,
    });

    setIsBulkModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={() => setIsBulkModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Gerador de Itens em Massa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre dezenas de itens homogêneos do lote com sequenciamento automático de código
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBulkModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selecione o Lote *
            </label>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lotNumber} - {l.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Base do Item *
            </label>
            <input
              type="text"
              required
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Ex: Notebook Dell Latitude 5420"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantidade de Itens *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custo Unitário Rateado (R$)
              </label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Estimado Unitário (R$)
              </label>
              <input
                type="number"
                value={unitEstimatedValue}
                onChange={(e) => setUnitEstimatedValue(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Gerar {quantity} Itens Agora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
