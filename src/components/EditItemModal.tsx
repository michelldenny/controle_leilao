import React, { useState, useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
import { PRODUCT_CATEGORIES } from "../constants/categories";
import { AuctionItem, ItemCondition, OperationalState, ItemStatus } from "../types";
import { X, Save, Package, DollarSign, MapPin, Tag } from "lucide-react";

interface EditItemModalProps {
  item: AuctionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose }) => {
  const { updateItem } = useAuction();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [formerAssetTag, setFormerAssetTag] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<ItemCondition>("usado");
  const [operationalState, setOperationalState] = useState<OperationalState>("funcionando");
  const [status, setStatus] = useState<ItemStatus>("disponivel");
  const [locationText, setLocationText] = useState("");
  const [primaryPhoto, setPrimaryPhoto] = useState("");
  const [apportionedCost, setApportionedCost] = useState(0);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [newProductMarketValue, setNewProductMarketValue] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(30);
  const [estimatedMarketAvg, setEstimatedMarketAvg] = useState(0);
  const [estimatedMarketMin, setEstimatedMarketMin] = useState(0);
  const [estimatedMarketMax, setEstimatedMarketMax] = useState(0);
  const [listedPrice, setListedPrice] = useState(0);
  const [description, setDescription] = useState("");

  const handleNewMarketValueChange = (val: number) => {
    setNewProductMarketValue(val);
    const calculatedSalePrice = val * (1 - discountPercentage / 100);
    const finalVal = Number(calculatedSalePrice.toFixed(2));
    setEstimatedMarketAvg(finalVal);
    setEstimatedMarketMin(Number((finalVal * 0.85).toFixed(2)));
    setEstimatedMarketMax(Number((finalVal * 1.15).toFixed(2)));
    if (!listedPrice || listedPrice === estimatedMarketAvg) {
      setListedPrice(finalVal);
    }
  };

  const handleDiscountChange = (pct: number) => {
    setDiscountPercentage(pct);
    if (newProductMarketValue > 0) {
      const calculatedSalePrice = newProductMarketValue * (1 - pct / 100);
      const finalVal = Number(calculatedSalePrice.toFixed(2));
      setEstimatedMarketAvg(finalVal);
      setEstimatedMarketMin(Number((finalVal * 0.85).toFixed(2)));
      setEstimatedMarketMax(Number((finalVal * 1.15).toFixed(2)));
    }
  };

  const handleEstimatedAvgChange = (val: number) => {
    setEstimatedMarketAvg(val);
    setEstimatedMarketMin(Number((val * 0.85).toFixed(2)));
    setEstimatedMarketMax(Number((val * 1.15).toFixed(2)));
    if (newProductMarketValue > 0) {
      const pct = ((newProductMarketValue - val) / newProductMarketValue) * 100;
      setDiscountPercentage(Number(pct.toFixed(1)));
    }
  };

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setCategory(item.category || "Informática");
      setSubcategory(item.subcategory || "");
      setBrand(item.brand || "");
      setModel(item.model || "");
      setSerialNumber(item.serialNumber || "");
      setFormerAssetTag(item.formerAssetTag || "");
      setQuantity(item.quantity || 1);
      setCondition(item.condition || "usado");
      setOperationalState(item.operationalState || "funcionando");
      setStatus(item.status || "disponivel");
      setLocationText(item.location?.customText || "");
      setPrimaryPhoto(item.primaryPhoto || "");
      setApportionedCost(item.apportionedCost || 0);
      setAdditionalCosts(item.additionalCosts || 0);
      
      const estAvg = item.estimatedMarketAvg || 0;
      setEstimatedMarketAvg(estAvg);
      setEstimatedMarketMin(item.estimatedMarketMin || Number((estAvg * 0.85).toFixed(2)));
      setEstimatedMarketMax(item.estimatedMarketMax || Number((estAvg * 1.15).toFixed(2)));
      
      // Estimar o valor do produto novo inicial como estAvg / 0.7 (considerando 30% desc padrão)
      const initialNewVal = estAvg > 0 ? Number((estAvg / 0.7).toFixed(2)) : 0;
      setNewProductMarketValue(initialNewVal);
      setDiscountPercentage(30);

      setListedPrice(item.listedPrice || estAvg);
      setDescription(item.description || "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateItem(item.id, {
      name,
      category,
      quantity: Number(quantity),
      condition,
      operationalState,
      status,
      location: {
        ...item.location,
        customText: locationText,
      },
      primaryPhoto,
      photos: primaryPhoto ? [primaryPhoto, ...(item.photos || []).filter((p) => p !== primaryPhoto)] : item.photos,
      apportionedCost: Number(apportionedCost),
      additionalCosts: Number(additionalCosts),
      realTotalCost: Number(apportionedCost) + Number(additionalCosts),
      estimatedMarketMin: Number(estimatedMarketMin),
      estimatedMarketAvg: Number(estimatedMarketAvg),
      estimatedMarketMax: Number(estimatedMarketMax),
      listedPrice: Number(estimatedMarketAvg),
      description,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Editar Item: <span className="text-amber-500 font-mono">{item.code}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificação do Bem */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Identificação do Bem</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Item / Título *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
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
                  Status no Estoque
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ItemStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="anunciado">Anunciado</option>
                  <option value="vendido" disabled={status !== "vendido"}>
                    Vendido {status !== "vendido" ? "(Registrar pelo Módulo de Vendas)" : ""}
                  </option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="aguardando_retirada">Aguardando Retirada</option>
                  <option value="em_transporte">Em Transporte</option>
                  <option value="armazenado">Armazenado</option>
                  <option value="reservado">Reservado</option>
                  <option value="uso_proprio">Uso Próprio (Patrimônio)</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Condição Física
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="novo">Novo / Lacrado</option>
                  <option value="seminovo">Seminovo</option>
                  <option value="usado">Usado (Bom Estado)</option>
                  <option value="recondicionado">Recondicionado / Revisado</option>
                  <option value="avariado">Avariado / Para Peças</option>
                  <option value="sucata">Sucata</option>
                  <option value="nao_testado">Não Testado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localização & Fotos */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Localização Física e Foto Principal</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Localização Física *
                </label>
                <select
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="apê Michell">apê Michell</option>
                  <option value="apê William">apê William</option>
                  <option value="apê Paulão">apê Paulão</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL da Foto Principal
                </label>
                <input
                  type="url"
                  value={primaryPhoto}
                  onChange={(e) => setPrimaryPhoto(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Precificação & Valuation */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>Precificação e Valuation (Idêntico ao Cadastro Guiado)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                  1. Valor Mercado (Produto Novo) (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProductMarketValue}
                  onChange={(e) => handleNewMarketValueChange(Number(e.target.value))}
                  placeholder="Ex: 3500"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                  2. Desconto Comercial (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full p-2 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-extrabold"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                  3. Valor de Venda (Estimado) (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedMarketAvg}
                  onChange={(e) => handleEstimatedAvgChange(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custo Rateado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apportionedCost}
                  onChange={(e) => setApportionedCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custos Extras (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição Detalhada / Observações
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
