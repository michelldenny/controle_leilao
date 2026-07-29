import React, { useState, useEffect } from "react";
import { useAuction } from "../context/AuctionContext";
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
  const [estimatedMarketMin, setEstimatedMarketMin] = useState(0);
  const [estimatedMarketAvg, setEstimatedMarketAvg] = useState(0);
  const [estimatedMarketMax, setEstimatedMarketMax] = useState(0);
  const [listedPrice, setListedPrice] = useState(0);
  const [description, setDescription] = useState("");

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
      setEstimatedMarketMin(item.estimatedMarketMin || 0);
      setEstimatedMarketAvg(item.estimatedMarketAvg || 0);
      setEstimatedMarketMax(item.estimatedMarketMax || 0);
      setListedPrice(item.listedPrice || 0);
      setDescription(item.description || "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateItem(item.id, {
      name,
      category,
      subcategory,
      brand,
      model,
      serialNumber,
      formerAssetTag,
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
      listedPrice: Number(listedPrice),
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
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
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
          {/* Informações Básicas */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Identificação do Bem</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
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
                  <option value="descartado">Descartado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subcategoria
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nº de Série
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patrimônio Anterior
                </label>
                <input
                  type="text"
                  value={formerAssetTag}
                  onChange={(e) => setFormerAssetTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Condição & Estado */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <Package className="w-4 h-4 text-amber-500" />
              <span>Condição Física e Operacional</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Condição Física
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="novo">Novo</option>
                  <option value="seminovo">Seminovo</option>
                  <option value="usado">Usado</option>
                  <option value="avariado">Avariado</option>
                  <option value="sucata">Sucata</option>
                  <option value="nao_testado">Não Testado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado Operacional
                </label>
                <select
                  value={operationalState}
                  onChange={(e) => setOperationalState(e.target.value as OperationalState)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="funcionando">Funcionando Perfeitamente</option>
                  <option value="parcialmente_funcionando">Parcialmente Funcionando</option>
                  <option value="nao_funcionando">Não Funcionando</option>
                  <option value="nao_testado">Não Testado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Localização & Fotos */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Localização e Foto Principal</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Localização Física (Texto Livre)
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Ex: Galpão Principal > Corredor 2 > Estante 3"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
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

          {/* Valores & Valuation */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 border-b pb-1 border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>Custos e Precificação de Mercado</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Mercado Média (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedMarketAvg}
                  onChange={(e) => setEstimatedMarketAvg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preço Anunciado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={listedPrice}
                  onChange={(e) => setListedPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição Detalhada / Observações
            </label>
            <textarea
              rows={3}
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
