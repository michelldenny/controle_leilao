import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { SaleRecord } from "../types";
import { ShoppingBag, Plus, DollarSign, TrendingUp, CheckCircle2, X, Eye, Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

export const SalesView: React.FC = () => {
  const { items, lots, sales, recordSale, updateSale, deleteSale, openItemDetail, metrics } = useAuction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);
  const [deletingSale, setDeletingSale] = useState<SaleRecord | null>(null);

  // Sale Form State
  const [selectedItemId, setSelectedItemId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCpfCnpj, setBuyerCpfCnpj] = useState("");
  const [saleChannel, setSaleChannel] = useState("Mercado Livre");
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [platformCommission, setPlatformCommission] = useState<number>(0);
  const [sellerFreight, setSellerFreight] = useState<number>(0);
  const [taxes, setTaxes] = useState<number>(0);

  const [itemSearchText, setItemSearchText] = useState("");

  const availableItems = items
    .filter((i) => i.status !== "vendido" || (editingSale && i.id === editingSale.itemId))
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" }));

  const filteredAvailableItems = availableItems.filter((i) => {
    const q = itemSearchText.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q);
  });
  
  // Função para determinar o custo real do item (puxando o custo do item ou o custo total do lote caso zerado)
  const getItemRealCost = (itemObj?: any) => {
    if (!itemObj) return 0;
    if (itemObj.realTotalCost && itemObj.realTotalCost > 0) {
      return itemObj.realTotalCost;
    }
    const parentLot = lots.find((l) => l.id === itemObj.lotId);
    return parentLot?.totalLotCost || 0;
  };

  // Associar o histórico de vendas gravado na coleção sales com o item correspondente
  const salesHistory = sales.map((sale) => {
    const item = items.find((i) => i.id === sale.itemId);
    return {
      sale,
      item,
      itemCost: getItemRealCost(item),
    };
  });

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Live ROI Calculation Preview
  const realCost = getItemRealCost(selectedItem);
  const netSaleValue =
    Number(finalPrice) - Number(platformCommission) - Number(sellerFreight) - Number(taxes);
  const netProfit = netSaleValue - realCost;
  const roiPercentage = realCost > 0 ? (netProfit / realCost) * 100 : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const handleOpenNewSale = () => {
    setEditingSale(null);
    setSelectedItemId("");
    setBuyerName("");
    setBuyerCpfCnpj("");
    setSaleChannel("Mercado Livre");
    setFinalPrice(0);
    setPlatformCommission(0);
    setSellerFreight(0);
    setTaxes(0);
    setIsModalOpen(true);
  };

  const handleOpenEditSale = (sale: SaleRecord) => {
    setEditingSale(sale);
    setSelectedItemId(sale.itemId);
    setBuyerName(sale.buyerName || "");
    setBuyerCpfCnpj(sale.buyerDoc || "");
    setSaleChannel(sale.platform || "Mercado Livre");
    setFinalPrice(sale.finalPrice || 0);
    setPlatformCommission(sale.platformCommission || 0);
    setSellerFreight(sale.sellerFreight || 0);
    setTaxes(sale.taxes || 0);
    setIsModalOpen(true);
  };

  const handleDeleteSaleItem = (sale: SaleRecord) => {
    const item = items.find((i) => i.id === sale.itemId);
    const itemName = item ? item.name : "esta venda";
    if (window.confirm(`Tem certeza que deseja excluir o registro de venda de "${itemName}"? O item retornará para o estoque como "Disponível".`)) {
      deleteSale(sale.id);
    }
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      updateSale(editingSale.id, {
        buyerName,
        buyerDoc: buyerCpfCnpj,
        platform: saleChannel as any,
        finalPrice: Number(finalPrice),
        platformCommission: Number(platformCommission),
        sellerFreight: Number(sellerFreight),
        taxes: Number(taxes),
      });
      setIsModalOpen(false);
      setEditingSale(null);
      return;
    }

    if (!selectedItemId || !buyerName || finalPrice <= 0) return;

    recordSale({
      itemId: selectedItemId,
      buyerName,
      buyerDoc: buyerCpfCnpj,
      platform: saleChannel as any,
      saleDate: new Date().toISOString().split("T")[0],
      finalPrice: Number(finalPrice),
      platformCommission: Number(platformCommission),
      sellerFreight: Number(sellerFreight),
      taxes: Number(taxes),
      otherExpenses: 0,
      paymentMethod: "Pix",
      paymentStatus: "pago",
    });

    setIsModalOpen(false);
    setSelectedItemId("");
    setBuyerName("");
    setBuyerCpfCnpj("");
    setFinalPrice(0);
    setPlatformCommission(0);
    setSellerFreight(0);
    setTaxes(0);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-500" />
            <span>Módulo de Vendas & Análise de ROI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro de comercialização dos bens arrematados, com abatimento automático de taxas, fretes e cálculo de lucro líquido
          </p>
        </div>

        <button
          onClick={handleOpenNewSale}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Venda</span>
        </button>
      </div>

      {/* KPI Cards for Sales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-400 block">Total Vendido (Faturamento Bruto)</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(metrics.totalSoldAmount)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{sales.length} vendas registradas</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-400 block">Lucro Líquido Realizado</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(metrics.realizedProfit)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Líquido no bolso</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-400 block">Retorno Sobre Investimento (ROI Médio)</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {(() => {
              const totalSoldItemsCost = salesHistory.reduce((sum, h) => sum + h.itemCost, 0);
              return totalSoldItemsCost > 0
                ? `${((metrics.realizedProfit / totalSoldItemsCost) * 100).toFixed(1)}%`
                : "0%";
            })()}
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Rendimento das vendas realizadas</span>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Histórico de Vendas Realizadas ({sales.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Item / Código</th>
                <th className="p-3">Comprador</th>
                <th className="p-3">Canal</th>
                <th className="p-3 text-right">Preço Final</th>
                <th className="p-3 text-right">Custo Real Total</th>
                <th className="p-3 text-right">Lucro Líquido</th>
                <th className="p-3 text-right">ROI %</th>
                <th className="p-3 text-center">Dias p/ ROI</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {salesHistory.map(({ sale, item, itemCost }) => {
                const purchaseDateStr = item?.purchaseDate || item?.dateAdded;
                let daysToRoi = 0;
                if (purchaseDateStr && sale.saleDate) {
                  const pDate = new Date(purchaseDateStr);
                  const sDate = new Date(sale.saleDate);
                  const diffTime = sDate.getTime() - pDate.getTime();
                  daysToRoi = Math.max(0, Math.floor(diffTime / (1000 * 3600 * 24)));
                }

                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <div>{item ? item.name : "Item Excluído/Não Localizado"}</div>
                      <span className="text-[10px] text-amber-600 font-mono">{item ? item.code : sale.itemId}</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{sale.buyerName}</td>
                    <td className="p-3 text-slate-500">{sale.platform}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(sale.finalPrice)}</td>
                    <td className="p-3 text-right text-slate-500">{formatCurrency(itemCost)}</td>
                    <td
                      className={`p-3 text-right font-extrabold ${
                        (sale.netProfit || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(sale.netProfit || 0) >= 0 ? "+" : ""}{formatCurrency(sale.netProfit)}
                    </td>
                    <td
                      className={`p-3 text-right font-extrabold ${
                        (sale.roiPercentage || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(sale.roiPercentage || 0) >= 0 ? "+" : ""}{(sale.roiPercentage || 0).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold">
                        {daysToRoi} {daysToRoi === 1 ? "dia" : "dias"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingSale(sale)}
                          title="Ver Detalhes da Venda"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditSale(sale)}
                          title="Editar Venda"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSale(sale)}
                          title="Excluir Venda"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Sale Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                <span>Registrar Venda de Item</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selecione o Item do Estoque *
                </label>
                <input
                  type="text"
                  value={itemSearchText}
                  onChange={(e) => setItemSearchText(e.target.value)}
                  placeholder="Digite para filtrar itens por nome ou código..."
                  className="w-full mb-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedItemId(id);
                    const found = items.find((i) => i.id === id);
                    if (found) {
                      setFinalPrice(found.listedPrice || found.estimatedMarketAvg);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">Selecione um item ({filteredAvailableItems.length} encontrado(s))...</option>
                  {filteredAvailableItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.code}] {i.name} (Custo: R$ {getItemRealCost(i).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Comprador *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CPF / CNPJ Comprador
                  </label>
                  <input
                    type="text"
                    value={buyerCpfCnpj}
                    onChange={(e) => setBuyerCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Canal de Venda *
                  </label>
                  <select
                    value={saleChannel}
                    onChange={(e) => setSaleChannel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="OLX">OLX</option>
                    <option value="Grupo WhatsApp">Grupo WhatsApp</option>
                    <option value="Direto / Balcão">Direto / Balcão</option>
                    <option value="Instagram / Redes">Instagram / Redes</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preço Final Acordado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold"
                  />
                </div>
              </div>

              {/* Deduction Expenses */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Impostos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxes}
                    onChange={(e) => setTaxes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Comissão Plataforma (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={platformCommission}
                    onChange={(e) => setPlatformCommission(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frete (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellerFreight}
                    onChange={(e) => setSellerFreight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Simulation Box */}
              {selectedItem && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    Simulação de Lucro Líquido & ROI:
                  </span>
                  <div className="flex justify-between">
                    <span>Custo do Item:</span>
                    <strong>{formatCurrency(realCost)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro Líquido Projetado:</span>
                    <strong className="text-emerald-600">{formatCurrency(netProfit)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Estimado:</span>
                    <strong className="text-amber-600">{roiPercentage.toFixed(1)}%</strong>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                >
                  {editingSale ? "Salvar Alterações" : "Confirmar Venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Sale Modal */}
      {viewingSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setViewingSale(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                <span>Detalhes da Venda Realizada</span>
              </h3>
              <button
                onClick={() => setViewingSale(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Item Comercializado</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {items.find((i) => i.id === viewingSale.itemId)?.name || viewingSale.itemId}
                </p>
                <p className="text-amber-600 font-mono text-[11px]">
                  {items.find((i) => i.id === viewingSale.itemId)?.code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Comprador</span>
                  <strong className="text-slate-900 dark:text-white">{viewingSale.buyerName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">CPF/CNPJ</span>
                  <strong className="text-slate-900 dark:text-white">{viewingSale.buyerDoc || "Não informado"}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Canal de Venda</span>
                  <strong className="text-slate-900 dark:text-white">{viewingSale.platform}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Data da Venda</span>
                  <strong className="text-slate-900 dark:text-white">{viewingSale.saleDate}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 block text-[10px]">Frete Vendedor</span>
                  <strong className="text-slate-900 dark:text-white">{formatCurrency(viewingSale.sellerFreight)}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 block text-[10px]">Impostos</span>
                  <strong className="text-slate-900 dark:text-white">{formatCurrency(viewingSale.taxes)}</strong>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Valor Líquido</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    {formatCurrency(viewingSale.netSaleValue)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Lucro Líquido</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    {formatCurrency(viewingSale.netProfit)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">ROI Obtido</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                    {viewingSale.roiPercentage?.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Sale Modal */}
      <ConfirmModal
        isOpen={!!deletingSale}
        title="Excluir Registro de Venda"
        message={`Tem certeza que deseja excluir o registro de venda? O item retornará para o estoque como "Disponível".`}
        confirmText="Excluir Venda"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deletingSale) {
            deleteSale(deletingSale.id);
            setDeletingSale(null);
          }
        }}
        onCancel={() => setDeletingSale(null)}
      />
    </div>
  );
};
