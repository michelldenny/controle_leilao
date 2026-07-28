import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Plus,
  Sparkles,
} from "lucide-react";
import { ItemCondition } from "../types";

export const ItemWizardModal: React.FC = () => {
  const { isWizardOpen, setIsWizardOpen, auctions, lots, addAuction, addLot, addItem } = useAuction();

  const [step, setStep] = useState(1);

  // Wizard State
  // Step 1: Leilão
  const [auctionId, setAuctionId] = useState("");
  const [auctionName, setAuctionName] = useState("");
  const [auctioneer, setAuctioneer] = useState("");

  // Step 2: Lote
  const [selectedLotId, setSelectedLotId] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [winningBid, setWinningBid] = useState(1000);
  const [commission, setCommission] = useState(50);
  const [transportCost, setTransportCost] = useState(100);
  const [otherCosts, setOtherCosts] = useState(0);

  // Step 3: Nome do Item e Categoria
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Eletrodomésticos");
  const [condition, setCondition] = useState<ItemCondition>("usado");

  // Step 4: Fotos
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800");

  // Step 5: Valoração de Mercado
  const [estimatedValue, setEstimatedValue] = useState(2500);

  // Initialize selected auction when modal opens
  useEffect(() => {
    if (isWizardOpen) {
      if (auctions.length > 0 && !auctionId) {
        setAuctionId(auctions[0].id);
      }
    }
  }, [isWizardOpen, auctions]);

  // Available lots for the selected auction
  const availableLots = lots.filter((l) => !auctionId || l.auctionId === auctionId);

  // When selectedLotId changes, auto-fill lot data
  useEffect(() => {
    if (selectedLotId && selectedLotId !== "new") {
      const found = lots.find((l) => l.id === selectedLotId);
      if (found) {
        setLotNumber(found.lotNumber);
        setWinningBid(found.winningBid || 0);
        setCommission(found.auctioneerCommission || 0);
        setTransportCost(found.transportCost || 0);
        const extra =
          (found.adminFee || 0) +
          (found.taxes || 0) +
          (found.disassemblyCost || 0) +
          (found.loadingCost || 0) +
          (found.storageCost || 0) +
          (found.otherCosts || 0);
        setOtherCosts(extra);
      }
    }
  }, [selectedLotId, lots]);

  if (!isWizardOpen) return null;

  const calculatedTotalLotCost = Number(winningBid) + Number(commission) + Number(transportCost) + Number(otherCosts);

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

    let targetLotId = selectedLotId;

    if (!targetLotId || targetLotId === "new") {
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
        otherCosts: Number(otherCosts),
        itemCount: 1,
        paymentDeadline: new Date().toISOString().split("T")[0],
        pickupDeadline: new Date().toISOString().split("T")[0],
        paymentStatus: "pago",
        pickupStatus: "retirado",
      });
      targetLotId = newLot.id;
    }

    addItem({
      auctionId: targetAuctionId || auctions[0]?.id || "auc_1",
      lotId: targetLotId,
      name: itemName || "Item Arrematado",
      category: category || "Eletrodomésticos",
      condition,
      operationalState: "funcionando",
      photos: [photoUrl],
      primaryPhoto: photoUrl,
      apportionedCost: 0,
      additionalCosts: 0,
      estimatedMarketMin: Number(estimatedValue) * 0.85,
      estimatedMarketMax: Number(estimatedValue) * 1.15,
      estimatedMarketAvg: Number(estimatedValue),
      listedPrice: Number(estimatedValue) * 0.95,
      status: "disponivel",
      location: {
        customText: "Depósito Central",
      },
      documents: [],
    });

    setIsWizardOpen(false);
    setStep(1);
    setSelectedLotId("");
    setItemName("");
  };

  const stepsTitle = [
    "1. Leilão Origem",
    "2. Seleção do Lote",
    "3. Nome do Item e Categoria",
    "4. Fotos do Bem",
    "5. Valuation de Mercado",
    "6. Resumo & Conclusão",
  ];

  const totalSteps = stepsTitle.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={() => setIsWizardOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto cursor-default text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Cadastro Guiado de Arrematação
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {stepsTitle[step - 1]}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWizardOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Contents */}
        <div className="py-2 text-xs space-y-4">
          {/* STEP 1: LEILÃO */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Selecione o Leilão Cadastrado:
                </label>
                {auctions.length > 0 ? (
                  <select
                    value={auctionId}
                    onChange={(e) => {
                      setAuctionId(e.target.value);
                      setSelectedLotId("");
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {auctions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.auctioneer || "Leiloeiro"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl">
                    Nenhum leilão cadastrado no banco de dados. Digite o nome do novo leilão abaixo:
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Ou crie um novo leilão agora:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do Leilão (ex: Leilão de Frota Banco X)"
                    value={auctionName}
                    onChange={(e) => {
                      setAuctionName(e.target.value);
                      if (e.target.value) setAuctionId("");
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Leiloeiro / Plataforma"
                    value={auctioneer}
                    onChange={(e) => setAuctioneer(e.target.value)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOTE (Puxa informações automaticamente) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Escolha o Lote Cadastrado (Puxa Custos Automaticamente):
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Selecionar um Lote Cadastrado --</option>
                  {availableLots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} - Lance: R$ {(l.winningBid || 0).toLocaleString("pt-BR")} | Custo Total: R$ {(l.totalLotCost || 0).toLocaleString("pt-BR")}
                    </option>
                  ))}
                  <option value="new">+ Cadastrar Novo Lote Manualmente</option>
                </select>
              </div>

              {selectedLotId && selectedLotId !== "new" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Dados Puxados Automaticamente do Lote {lotNumber}:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-500/10">
                      <span className="block text-[10px] text-slate-500">Lance Vencedor:</span>
                      <strong className="text-slate-900 dark:text-white">R$ {winningBid.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-500/10">
                      <span className="block text-[10px] text-slate-500">Comissão Leiloeiro:</span>
                      <strong className="text-slate-900 dark:text-white">R$ {commission.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-amber-500/10">
                      <span className="block text-[10px] text-slate-500">Frete/Retirada:</span>
                      <strong className="text-slate-900 dark:text-white">R$ {transportCost.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 font-extrabold">
                      <span className="block text-[10px] opacity-80">Custo Total Lote:</span>
                      <span>R$ {calculatedTotalLotCost.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              )}

              {(!selectedLotId || selectedLotId === "new") && (
                <div className="space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Definir Dados do Novo Lote:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Número / Identificação do Lote
                      </label>
                      <input
                        type="text"
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                        placeholder="Ex: Lote 04"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Valor do Lance Vencedor (R$)
                      </label>
                      <input
                        type="number"
                        value={winningBid}
                        onChange={(e) => setWinningBid(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Comissão Leiloeiro (R$)
                      </label>
                      <input
                        type="number"
                        value={commission}
                        onChange={(e) => setCommission(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Frete / Logística (R$)
                      </label>
                      <input
                        type="number"
                        value={transportCost}
                        onChange={(e) => setTransportCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: NOME DO ITEM E CATEGORIA */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Nome / Descrição do Item
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ex: Geladeira Brastemp Frost Free 400L Inox"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Categoria do Bem
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Eletrodomésticos">Eletrodomésticos</option>
                  <option value="Eletrônicos & TI">Eletrônicos & TI</option>
                  <option value="Máquinas & Equipamentos">Máquinas & Equipamentos</option>
                  <option value="Móveis & Escritório">Móveis & Escritório</option>
                  <option value="Veículos">Veículos</option>
                  <option value="Ferramentas & Utilidades">Ferramentas & Utilidades</option>
                  <option value="Imóveis">Imóveis</option>
                  <option value="Diversos">Diversos</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Estado de Conservação
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="novo">Novo / Lacrado</option>
                  <option value="usado">Usado (Bom Estado)</option>
                  <option value="recondicionado">Recondicionado / Revisado</option>
                  <option value="avariado">Avariado / Para Peças</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: FOTOS DO BEM */}
          {step === 4 && (
            <div className="space-y-3">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                URL da Foto Principal do Item
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Cole o link da foto do item"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800";
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: VALUATION DE MERCADO */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Valor Estimado de Mercado para Revenda (R$)
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Simulação Financeira do Item:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-500">Custo Total Atribuído:</span>
                    <strong className="text-slate-900 dark:text-white text-sm">
                      R$ {calculatedTotalLotCost.toLocaleString("pt-BR")}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Lucro Bruto Estimado:</span>
                    <strong
                      className={`text-sm ${
                        estimatedValue - calculatedTotalLotCost >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500"
                      }`}
                    >
                      R$ {(estimatedValue - calculatedTotalLotCost).toLocaleString("pt-BR")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: RESUMO E CONCLUSÃO */}
          {step === 6 && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                <span>Resumo da Arrematação a Ser Cadastrada:</span>
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Nome do Item:</strong> {itemName || "Item Arrematado"}
                </p>
                <p>
                  <strong>Categoria:</strong> {category}
                </p>
                <p>
                  <strong>Lote:</strong> {lotNumber || "Lote"}
                </p>
                <p>
                  <strong>Custo Atribuído:</strong> R$ {calculatedTotalLotCost.toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Valor Estimado de Revenda:</strong> R$ {Number(estimatedValue).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all"
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

