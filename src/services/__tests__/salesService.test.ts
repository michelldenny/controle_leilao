import { describe, it, expect } from "vitest";
import { saleRecordSchema } from "../../schemas/zodSchemas";

describe("saleRecordSchema Validation", () => {
  it("deve validar com sucesso os dados mínimos de venda (enviados pelo formulário de vendas)", () => {
    const minimalData = {
      itemId: "item-123",
      buyerName: "João Silva",
      platform: "Venda Direta",
      saleDate: "2026-08-07",
      finalPrice: 500,
      sellerFreight: 0,
      platformCommission: 0,
      taxes: 0,
      otherExpenses: 0,
      paymentMethod: "Pix",
      paymentStatus: "pago",
    };

    const parseRes = saleRecordSchema.safeParse(minimalData);
    expect(parseRes.success).toBe(true);
  });

  it("deve validar com sucesso quando campos de comprador forem vazios ou nulos", () => {
    const validData = {
      itemId: "item-123",
      buyerName: "Maria Souza",
      buyerDoc: "",
      buyerPhone: "",
      buyerEmail: "",
      platform: "Mercado Livre",
      saleDate: "2026-08-07",
      finalPrice: 1200,
    };

    const parseRes = saleRecordSchema.safeParse(validData);
    expect(parseRes.success).toBe(true);
  });

  it("deve rejeitar venda quando itemId estiver ausente ou vazio", () => {
    const invalidData = {
      itemId: "",
      buyerName: "Carlos",
      platform: "OLX",
      saleDate: "2026-08-07",
      finalPrice: 100,
    };

    const parseRes = saleRecordSchema.safeParse(invalidData);
    expect(parseRes.success).toBe(false);
  });
});
