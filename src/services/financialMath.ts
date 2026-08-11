/**
 * Biblioteca financeira pura para Controle de Leilões.
 * Funções puras, determinísticas e sem efeito colateral.
 */

export interface ApportionableItem {
  id: string;
  estimatedMarketAvg?: number;
  additionalCosts?: number;
  isSold?: boolean;
  status?: string;
}

export interface ApportionmentResult {
  itemId: string;
  apportionedCost: number;
  assignedPercent: number;
  realTotalCost: number;
}

/**
 * Arredonda um valor numérico para exatamente 2 casas decimais.
 */
export function roundToCents(amount: number): number {
  return Number((Math.round(amount * 100) / 100).toFixed(2));
}

/**
 * Calcula o custo total desembolsado para a arrematação de um lote.
 */
export function calculateTotalLotCost(params: {
  winningBid: number;
  auctioneerCommission?: number;
  adminFee?: number;
  taxes?: number;
  transportCost?: number;
  disassemblyCost?: number;
  otherCosts?: number;
}): number {
  const {
    winningBid = 0,
    auctioneerCommission = 0,
    adminFee = 0,
    taxes = 0,
    transportCost = 0,
    disassemblyCost = 0,
    otherCosts = 0,
  } = params;

  const total =
    winningBid +
    auctioneerCommission +
    adminFee +
    taxes +
    transportCost +
    disassemblyCost +
    otherCosts;

  return roundToCents(total);
}

/**
 * Calcula o valor líquido recebido em uma venda após descontar taxas, frete e comissões.
 */
export function calculateNetSaleValue(params: {
  finalPrice: number;
  sellerFreight?: number;
  platformCommission?: number;
  taxes?: number;
  otherExpenses?: number;
}): number {
  const {
    finalPrice = 0,
    sellerFreight = 0,
    platformCommission = 0,
    taxes = 0,
    otherExpenses = 0,
  } = params;

  return roundToCents(finalPrice - sellerFreight - platformCommission - taxes - otherExpenses);
}

/**
 * Calcula o Lucro Líquido Efetivo (Receita Líquida - CMV / Custo de Aquisição).
 */
export function calculateNetProfit(netSaleValue: number, costBasis: number): number {
  return roundToCents(netSaleValue - costBasis);
}

/**
 * Calcula o Retorno sobre o Investimento (ROI %) = (Lucro Líquido / Custo de Aquisição) * 100.
 */
export function calculateROI(netProfit: number, costBasis: number): number {
  if (costBasis <= 0) return 0;
  return roundToCents((netProfit / costBasis) * 100);
}

/**
 * Calcula a Margem Líquida (%) = (Lucro Líquido / Receita Líquida) * 100.
 */
export function calculateNetMargin(netProfit: number, netSaleValue: number): number {
  if (netSaleValue <= 0) return 0;
  return roundToCents((netProfit / netSaleValue) * 100);
}

/**
 * Rateio exato de custos de lote entre itens ativos em estoque.
 * Garante compensação de centavos no último item ativo para que a soma dos rateios seja exatamente igual a totalLotCost.
 */
export function apportionLotCostExact(
  totalLotCost: number,
  items: ApportionableItem[],
  method: "igualitario" | "manual" | "percentual" | "valor_estimado",
  customValues?: { itemId: string; value: number }[]
): ApportionmentResult[] {
  // Filtra apenas itens elegíveis (exclui apenas descartados)
  const activeItems = items.filter((i) => i.status !== "descartado");
  if (activeItems.length === 0) return [];

  const count = activeItems.length;
  let accumulatedApportioned = 0;
  const results: ApportionmentResult[] = [];

  activeItems.forEach((item, idx) => {
    let apportioned = 0;
    let assignedPercent = 0;

    if (method === "igualitario") {
      if (idx === count - 1) {
        apportioned = roundToCents(totalLotCost - accumulatedApportioned);
      } else {
        apportioned = roundToCents(totalLotCost / count);
        accumulatedApportioned += apportioned;
      }
      assignedPercent = totalLotCost > 0 ? roundToCents((apportioned / totalLotCost) * 100) : 0;
    } else if (method === "manual" && customValues) {
      const found = customValues.find((cv) => cv.itemId === item.id);
      apportioned = found ? roundToCents(found.value) : 0;
      assignedPercent = totalLotCost > 0 ? roundToCents((apportioned / totalLotCost) * 100) : 0;
    } else if (method === "percentual" && customValues) {
      const found = customValues.find((cv) => cv.itemId === item.id);
      assignedPercent = found ? roundToCents(found.value) : 0;
      apportioned = roundToCents((totalLotCost * assignedPercent) / 100);
    } else if (method === "valor_estimado") {
      const sumEstimated = activeItems.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 1), 0);
      const itemEst = item.estimatedMarketAvg || 1;
      assignedPercent = sumEstimated > 0 ? roundToCents((itemEst / sumEstimated) * 100) : roundToCents(100 / count);
      apportioned = roundToCents((totalLotCost * assignedPercent) / 100);
    }

    const realTotalCost = roundToCents(apportioned + (item.additionalCosts || 0));

    results.push({
      itemId: item.id,
      apportionedCost: apportioned,
      assignedPercent,
      realTotalCost,
    });
  });

  return results;
}

/**
 * Calcula o lucro bruto potencial do estoque sem truncar prejuízos.
 */
export function calculatePotentialProfit(estimatedMarketTotal: number, costTotal: number): number {
  return roundToCents(estimatedMarketTotal - costTotal);
}

export interface AgingBreakdown {
  range0To30: { count: number; cost: number; est: number };
  range31To60: { count: number; cost: number; est: number };
  range61To90: { count: number; cost: number; est: number };
  range91To180: { count: number; cost: number; est: number };
  rangeOver180: { count: number; cost: number; est: number };
}

/**
 * Agrupa itens do estoque por faixas de dias em estoque (Aging).
 */
export function calculateAgingBreakdown(
  items: { realTotalCost?: number; estimatedMarketAvg?: number; daysInStock?: number; isSold?: boolean; status?: string }[]
): AgingBreakdown {
  const result: AgingBreakdown = {
    range0To30: { count: 0, cost: 0, est: 0 },
    range31To60: { count: 0, cost: 0, est: 0 },
    range61To90: { count: 0, cost: 0, est: 0 },
    range91To180: { count: 0, cost: 0, est: 0 },
    rangeOver180: { count: 0, cost: 0, est: 0 },
  };

  const activeItems = items.filter((i) => !i.isSold && i.status !== "descartado" && i.status !== "uso_proprio");

  activeItems.forEach((item) => {
    const days = item.daysInStock || 0;
    const cost = item.realTotalCost || 0;
    const est = item.estimatedMarketAvg || 0;

    if (days <= 30) {
      result.range0To30.count += 1;
      result.range0To30.cost += cost;
      result.range0To30.est += est;
    } else if (days <= 60) {
      result.range31To60.count += 1;
      result.range31To60.cost += cost;
      result.range31To60.est += est;
    } else if (days <= 90) {
      result.range61To90.count += 1;
      result.range61To90.cost += cost;
      result.range61To90.est += est;
    } else if (days <= 180) {
      result.range91To180.count += 1;
      result.range91To180.cost += cost;
      result.range91To180.est += est;
    } else {
      result.rangeOver180.count += 1;
      result.rangeOver180.cost += cost;
      result.rangeOver180.est += est;
    }
  });

  result.range0To30.cost = roundToCents(result.range0To30.cost);
  result.range0To30.est = roundToCents(result.range0To30.est);
  result.range31To60.cost = roundToCents(result.range31To60.cost);
  result.range31To60.est = roundToCents(result.range31To60.est);
  result.range61To90.cost = roundToCents(result.range61To90.cost);
  result.range61To90.est = roundToCents(result.range61To90.est);
  result.range91To180.cost = roundToCents(result.range91To180.cost);
  result.range91To180.est = roundToCents(result.range91To180.est);
  result.rangeOver180.cost = roundToCents(result.rangeOver180.cost);
  result.rangeOver180.est = roundToCents(result.rangeOver180.est);

  return result;
}

/**
 * Calcula a taxa de Sell-Through (%) = (Itens Vendidos / Total de Itens Adquiridos) * 100.
 */
export function calculateSellThroughRate(totalAcquired: number, totalSold: number): number {
  if (totalAcquired <= 0) return 0;
  return roundToCents((totalSold / totalAcquired) * 100);
}

/**
 * Calcula o Ticket Médio de Venda = Total Recebido / Número de Vendas.
 */
export function calculateAverageTicket(totalRevenue: number, salesCount: number): number {
  if (salesCount <= 0) return 0;
  return roundToCents(totalRevenue / salesCount);
}

/**
 * Calcula a depreciação linear acumulada de um bem de uso próprio.
 * @param acquisitionCost Custo de aquisição do bem.
 * @param usefulLifeMonths Vida útil em meses (ex: 60 meses = 5 anos).
 * @param monthsInUse Quantidade de meses em uso desde a incorporação.
 * @param residualValue Valor residual final estimado após a vida útil.
 */
export function calculateLinearDepreciation(
  acquisitionCost: number,
  usefulLifeMonths: number,
  monthsInUse: number,
  residualValue: number = 0
): { monthlyDepreciation: number; accumulatedDepreciation: number; bookValue: number } {
  if (usefulLifeMonths <= 0 || acquisitionCost <= 0) {
    return { monthlyDepreciation: 0, accumulatedDepreciation: 0, bookValue: acquisitionCost };
  }

  const depreciableAmount = Math.max(0, acquisitionCost - residualValue);
  const monthlyDepreciation = roundToCents(depreciableAmount / usefulLifeMonths);
  const cappedMonths = Math.min(monthsInUse, usefulLifeMonths);
  const accumulatedDepreciation = roundToCents(monthlyDepreciation * cappedMonths);
  const bookValue = roundToCents(Math.max(residualValue, acquisitionCost - accumulatedDepreciation));

  return { monthlyDepreciation, accumulatedDepreciation, bookValue };
}

/**
 * Calcula o percentual de atingimento de uma meta financeira (ex: Receita ou Lucro).
 */
export function calculateGoalProgress(realized: number, target: number): number {
  if (target <= 0) return 0;
  return roundToCents((realized / target) * 100);
}


