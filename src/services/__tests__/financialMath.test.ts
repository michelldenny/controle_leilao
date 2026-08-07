import { describe, it, expect } from "vitest";
import {
  roundToCents,
  calculateTotalLotCost,
  calculateNetSaleValue,
  calculateNetProfit,
  calculateROI,
  calculateNetMargin,
  apportionLotCostExact,
  calculatePotentialProfit,
  calculateAgingBreakdown,
  calculateSellThroughRate,
  calculateAverageTicket,
  calculateLinearDepreciation,
  calculateGoalProgress,
} from "../financialMath";

describe("financialMath Service", () => {
  it("deve arredondar valores para exatamente 2 casas decimais", () => {
    expect(roundToCents(10.33333)).toBe(10.33);
    expect(roundToCents(10.336)).toBe(10.34);
    expect(roundToCents(0)).toBe(0);
  });

  it("deve calcular o custo total do lote incluindo comissão, taxas e transporte", () => {
    const total = calculateTotalLotCost({
      winningBid: 1000,
      auctioneerCommission: 50,
      adminFee: 20,
      taxes: 10,
      transportCost: 100,
      disassemblyCost: 30,
      otherCosts: 5,
    });
    expect(total).toBe(1215.0);
  });

  it("deve calcular a receita líquida de venda deduzindo frete, comissão e impostos", () => {
    const netValue = calculateNetSaleValue({
      finalPrice: 500,
      sellerFreight: 20,
      platformCommission: 50,
      taxes: 15,
      otherExpenses: 5,
    });
    expect(netValue).toBe(410.0);
  });

  it("deve calcular lucro líquido e ROI corretamente", () => {
    const netProfit = calculateNetProfit(400, 250);
    expect(netProfit).toBe(150.0);

    const roi = calculateROI(150, 250);
    expect(roi).toBe(60.0);

    const margin = calculateNetMargin(150, 400);
    expect(margin).toBe(37.5);
  });

  it("deve realizar rateio igualitário perfeito com compensação de centavos no último item", () => {
    // R$ 100,00 divididos em 3 itens = 33.33 + 33.33 + 33.34 = 100.00 exatos
    const items = [
      { id: "item-1" },
      { id: "item-2" },
      { id: "item-3" },
    ];

    const results = apportionLotCostExact(100.0, items, "igualitario");
    expect(results).toHaveLength(3);
    expect(results[0].apportionedCost).toBe(33.33);
    expect(results[1].apportionedCost).toBe(33.33);
    expect(results[2].apportionedCost).toBe(33.34);

    const sum = results.reduce((acc, curr) => acc + curr.apportionedCost, 0);
    expect(roundToCents(sum)).toBe(100.0);
  });

  it("deve ignorar itens vendidos e descartados no rateio", () => {
    const items = [
      { id: "item-1", status: "disponivel" },
      { id: "item-2", status: "descartado" },
      { id: "item-3", isSold: true },
    ];

    const results = apportionLotCostExact(100.0, items, "igualitario");
    expect(results).toHaveLength(1);
    expect(results[0].itemId).toBe("item-1");
    expect(results[0].apportionedCost).toBe(100.0);
  });

  it("deve calcular lucro potencial do estoque sem truncar prejuízos", () => {
    expect(calculatePotentialProfit(1500, 1000)).toBe(500);
    expect(calculatePotentialProfit(800, 1000)).toBe(-200);
  });

  it("deve agrupar aging do estoque nas faixas corretas de dias", () => {
    const items = [
      { daysInStock: 10, realTotalCost: 100, estimatedMarketAvg: 200, status: "disponivel" },
      { daysInStock: 45, realTotalCost: 150, estimatedMarketAvg: 300, status: "disponivel" },
      { daysInStock: 75, realTotalCost: 200, estimatedMarketAvg: 400, status: "disponivel" },
      { daysInStock: 120, realTotalCost: 250, estimatedMarketAvg: 500, status: "disponivel" },
      { daysInStock: 200, realTotalCost: 300, estimatedMarketAvg: 600, status: "disponivel" },
      { daysInStock: 10, isSold: true }, // Deve ignorar vendidos
    ];

    const breakdown = calculateAgingBreakdown(items);
    expect(breakdown.range0To30.count).toBe(1);
    expect(breakdown.range31To60.count).toBe(1);
    expect(breakdown.range61To90.count).toBe(1);
    expect(breakdown.range91To180.count).toBe(1);
    expect(breakdown.rangeOver180.count).toBe(1);
    expect(breakdown.rangeOver180.cost).toBe(300);
  });

  it("deve calcular Sell-Through Rate e Ticket Médio corretamente", () => {
    expect(calculateSellThroughRate(10, 4)).toBe(40.0);
    expect(calculateAverageTicket(1500, 3)).toBe(500.0);
  });

  it("deve calcular a depreciação linear acumulada e valor contábil corretamente", () => {
    // Bem de R$ 60.000, 60 meses de vida útil, 12 meses de uso, R$ 0 valor residual
    const dep = calculateLinearDepreciation(60000, 60, 12, 0);
    expect(dep.monthlyDepreciation).toBe(1000.0);
    expect(dep.accumulatedDepreciation).toBe(12000.0);
    expect(dep.bookValue).toBe(48000.0);
  });

  it("deve calcular progresso de meta financeira corretamente", () => {
    expect(calculateGoalProgress(75000, 100000)).toBe(75.0);
    expect(calculateGoalProgress(0, 100000)).toBe(0);
  });
});
