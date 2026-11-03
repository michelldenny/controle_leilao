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



/**
 * Tabela de Despesas Administrativas por faixa de lance vencedor (Clausula VIII do Edital).
 */
const ADMIN_FEE_TABLE = [
  { from: 0.01,    to: 99.99,      fee: 44.00 },
  { from: 100,     to: 199.99,     fee: 58.00 },
  { from: 200,     to: 299.99,     fee: 75.00 },
  { from: 300,     to: 399.99,     fee: 99.00 },
  { from: 400,     to: 499.99,     fee: 128.00 },
  { from: 500,     to: 649.99,     fee: 165.00 },
  { from: 650,     to: 799.99,     fee: 219.00 },
  { from: 800,     to: 999.99,     fee: 288.00 },
  { from: 1000,    to: 1099.99,    fee: 314.00 },
  { from: 1100,    to: 1999.99,    fee: 440.00 },
  { from: 2000,    to: 3999.99,    fee: 702.00 },
  { from: 4000,    to: 4999.99,    fee: 875.00 },
  { from: 5000,    to: 6999.99,    fee: 999.00 },
  { from: 7000,    to: 9999.99,    fee: 1235.00 },
  { from: 10000,   to: 14999.99,   fee: 1435.00 },
  { from: 15000,   to: 19999.99,   fee: 1870.00 },
  { from: 20000,   to: 24999.99,   fee: 2451.00 },
  { from: 25000,   to: 29999.99,   fee: 3122.00 },
  { from: 30000,   to: 34999.99,   fee: 3540.00 },
  { from: 35000,   to: 44999.99,   fee: 4308.00 },
  { from: 45000,   to: 54999.99,   fee: 5385.00 },
  { from: 55000,   to: 64999.99,   fee: 6413.00 },
  { from: 65000,   to: 74999.99,   fee: 7480.00 },
  { from: 75000,   to: 84999.99,   fee: 8591.00 },
  { from: 85000,   to: 99999.99,   fee: 9922.00 },
  { from: 100000,  to: 124999.99,  fee: 11979.00 },
  { from: 125000,  to: 149999.99,  fee: 14762.00 },
  { from: 150000,  to: 199999.99,  fee: 18755.00 },
  { from: 200000,  to: 224999.99,  fee: 23595.00 },
  { from: 225000,  to: 249999.99,  fee: 26136.00 },
  { from: 250000,  to: 299999.99,  fee: 30444.00 },
  { from: 300000,  to: 349999.99,  fee: 32074.00 },
  { from: 350000,  to: 399999.99,  fee: 41200.00 },
  { from: 400000,  to: 449999.99,  fee: 42585.00 },
  { from: 450000,  to: 499999.99,  fee: 52151.00 },
  { from: 500000,  to: 549999.99,  fee: 57838.00 },
  { from: 550000,  to: 599999.99,  fee: 64130.00 },
  { from: 600000,  to: 649999.99,  fee: 68123.00 },
  { from: 650000,  to: null,       fee: 77077.00 },
] as const satisfies { from: number; to: number | null; fee: number }[];

/**
 * Calcula automaticamente a Taxa Administrativa com base no valor do lance vencedor,
 * conforme tabela do Edital (Clausula VIII - Despesas Administrativas).
 * @param winningBid Valor do lance vencedor em R$.
 * @returns Valor fixo da taxa administrativa em R$.
 */
export function calculateAdminFeeFromTable(winningBid: number): number {
  if (!winningBid || winningBid <= 0) return 0;
  for (const row of ADMIN_FEE_TABLE) {
    if (row.to === null) {
      if (winningBid >= row.from) return row.fee;
    } else {
      if (winningBid >= row.from && winningBid <= row.to) return row.fee;
    }
  }
  return 0;
}
