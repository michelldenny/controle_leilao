import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import {
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  Gavel,
  Boxes,
  Package,
  DollarSign,
  Truck,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export const ItemWizardModal: React.FC = () => {
  const { isWizardOpen, setIsWizardOpen, auctions, addAuction, addLot, addItem } = useAuction();

  const [step, setStep] = useState(1);

  // Wizard State
  // Step 1: Leilão
  const [auctionId, setAuctionId] = useState(auctions[0]?.id || "");
  const [auctionName, setAuctionName] = useState("");
  const [auctioneer, setAuctioneer] = useState("");

  // Step 2: Lote
  const [lotNumber, setLotNumber] = useState("");
  const [winningBid, setWinningBid] = useState(1000);

  // Step 3: Taxas do Lote
  const [commission, setCommission] = useState(50);
  const [transportCost, setTransportCost] = useState(100);

  // Step 4: Detalhes do Item
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Eletrônicos & TI");
  const [condition, setCondition] = useState<any>("usado");

  // Step 5: Fotos & Documentos
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800");

  // Step 6: Localização
  const [warehouse, setWarehouse] = useState("Depósito Central - SP");
  const [shelf, setShelf] = useState("A-1");

  // Step 7: Valoração de Mercado
  const [estimatedValue, setEstimatedValue] = useState(2500);

  if (!isWizardOpen) return null;

  const handleFinish = () => {
    let targetAuctionId = auctionId;

    if (!targetAuctionId && auctionName) {
      const newAuc = addAuction({
        name: auctionName,
        auctioneer: auctioneer || "Leiloeiro Oficial",
        platform: auctioneer || "Plataforma",
        auctionType: "Judicial",
        auctionDate: new Date().toISOString().split("T")[0],
        city: "São Paulo",
        state: "SP",
        commissionPercentage: 5,
        status: "participando",
      });
      targetAuctionId = newAuc.id;
    }

    const newLot = addLot({
      auctionId: targetAuctionId || auctions[0]?.id || "auc_1",
      lotNumber: lotNumber || `Lote ${Math.floor(Math.random() * 900) + 100}`,
      description: `Lote ${lotNumber} - ${itemName}`,
      winningBid: Number(winningBid),
      auctioneerCommission: Number(commission),
      adminFee: 0,
      taxes: 0,
      transportCost: Number(transportCost),
      disassemblyCost: 0,
      loadingCost: 0,
      storageCost: 0,
      otherCosts: 0,
      itemCount: 1,
      paymentDeadline: new Date().toISOString().split("T")[0],
      pickupDeadline: new Date().toISOString().split("T")[0],
      paymentStatus: "pago",
      pickupStatus: "retirado",
    });

    addItem({
      auctionId: targetAuctionId || auctions[0]?.id || "auc_1",
      lotId: newLot.id,
      name: itemName || "Item Arrematado",
      category,
      condition,
      operationalState: "Testado / Funcionando",
      photos: [photoUrl],
      primaryPhoto: photoUrl,
      apportionedCost: Number(winningBid) + Number(commission) + Number(transportCost),
      additionalCosts: 0,
      estimatedMarketMin: Number(estimatedValue) * 0.8,
      estimatedMarketMax: Number(estimatedValue) * 1.2,
      estimatedMarketAvg: Number(estimatedValue),
      listedPrice: Number(estimatedValue) * 0.9,
      status: "disponivel",
      location: {
        warehouse,
        shelf,
        customText: `${warehouse} (Prateleira ${shelf})`,
      },
      documents: [],
    });

    setIsWizardOpen(false);
    setStep(1);
  };

  const stepsTitle = [
    "1. Leilão Origem",
    "2. Dados do Lote",
    "3. Custos do Lote",
    "4. Item Arrematado",
    "5. Fotos do Bem",
    "6. Armazenamento",
    "7. Valuation de Mercado",
    "8. Resumo & Conclusão",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={() => setIsWizardOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Fluxo Guiado de Arrematação (8 Etapas)
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {stepsTitle[step - 1]}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWizardOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* Step Contents */}
        <div className="py-2 text-xs space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Selecione um Leilão existente ou crie um novo:
              </label>
              <select
                value={auctionId}
                onChange={(e) => setAuctionId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {auctions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.auctioneer})
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">Ou crie um novo leilão agora:</span>
                <input
                  type="text"
                  placeholder="Nome do Novo Leilão"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Número do Lote</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Ex: Lote 12"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor do Lance Vencedor (R$)</label>
                <input
                  type="number"
                  value={winningBid}
                  onChange={(e) => setWinningBid(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Comissão do Leiloeiro (R$)</label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Custo de Frete/Retirada (R$)</label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome / Título do Item</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ex: Notebook Dell Latitude 5420 i7 16GB"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Eletrônicos & TI">Eletrônicos & TI</option>
                  <option value="Máquinas & Equipamentos">Máquinas & Equipamentos</option>
                  <option value="Móveis & Escritório">Móveis & Escritório</option>
                  <option value="Veículos">Veículos</option>
                  <option value="Imóveis">Imóveis</option>
                </select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL da Foto Principal</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Depósito / Armazém</label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prateleira / Posição</label>
                <input
                  type="text"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Estimado de Mercado para Revenda (R$)
              </label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base"
              />
              <p className="text-[11px] text-slate-400">
                Custo Calculado: R$ {(Number(winningBid) + Number(commission) + Number(transportCost)).toFixed(2)} | Lucro Estimado: R$ {(Number(estimatedValue) - (Number(winningBid) + Number(commission) + Number(transportCost))).toFixed(2)}
              </p>
            </div>
          )}

          {step === 8 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Resumo do Novo Item Arrematado:</h4>
              <p><strong>Item:</strong> {itemName}</p>
              <p><strong>Lote:</strong> {lotNumber}</p>
              <p><strong>Custo Total:</strong> R$ {(Number(winningBid) + Number(commission) + Number(transportCost)).toFixed(2)}</p>
              <p><strong>Valor Estimado:</strong> R$ {Number(estimatedValue).toFixed(2)}</p>
              <p><strong>Localização:</strong> {warehouse} ({shelf})</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {step < 8 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir e Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
