import { doc, runTransaction } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SaleRecord, AuctionItem, ActivityLog } from "../types";
import { saleRecordSchema } from "../schemas/zodSchemas";
import { calculateNetSaleValue, calculateNetProfit, calculateROI, calculateNetMargin } from "./financialMath";
import { recordLedgerEntry } from "./ledgerService";

export interface RecordSaleParams extends Omit<SaleRecord, "id" | "netSaleValue" | "netProfit" | "roiPercentage" | "marginPercentage" | "costBasisAtSale"> {}

/**
 * Serviço especializado nas operações de Venda, CMV e Reversão.
 */
export const SalesService = {
  /**
   * Executa a venda de um item de forma atômica no Firestore com congelamento de CMV e gravação no ledger.
   */
  async executeSale(params: RecordSaleParams, userRole: string = "admin"): Promise<{ sale: SaleRecord; netProfit: number; roi: number }> {
    const parseRes = saleRecordSchema.safeParse(params);
    if (!parseRes.success) {
      const issues = (parseRes as any).error?.issues || [];
      const msg = issues[0]?.message || "Dados de venda inválidos";
      throw new Error(msg);
    }

    const saleId = "sale-" + crypto.randomUUID();
    const logId = "log-" + crypto.randomUUID();
    const itemRef = doc(db, "items", params.itemId);
    const saleRef = doc(db, "sales", saleId);
    const logRef = doc(db, "activityLogs", logId);

    let resultSale: SaleRecord | null = null;
    let resultNetProfit = 0;
    let resultRoi = 0;

    await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error("Item não encontrado no inventário.");
      }

      const item = itemSnap.data() as AuctionItem;

      if (item.isSold || item.status === "vendido") {
        throw new Error("Este item já foi marcado como vendido.");
      }

      if (item.costAllocationStatus === "pendente") {
        throw new Error("O rateio de custos do lote está pendente. Conclua o rateio antes da venda.");
      }

      const costBasis = item.realTotalCost || 0;
      const sellerFreight = params.sellerFreight ?? 0;
      const platformCommission = params.platformCommission ?? 0;
      const taxes = params.taxes ?? 0;
      const otherExpenses = params.otherExpenses ?? 0;

      const netSaleValue = calculateNetSaleValue({
        finalPrice: params.finalPrice,
        sellerFreight,
        platformCommission,
        taxes,
        otherExpenses,
      });

      const netProfit = calculateNetProfit(netSaleValue, costBasis);
      const roiPercentage = calculateROI(netProfit, costBasis);
      const marginPercentage = calculateNetMargin(netProfit, netSaleValue);

      resultNetProfit = netProfit;
      resultRoi = roiPercentage;

      const listedPrice = params.listedPrice ?? item.listedPrice ?? item.estimatedMarketAvg ?? params.finalPrice ?? 0;
      const negotiatedPrice = params.negotiatedPrice ?? params.finalPrice ?? 0;
      const discount = params.discount ?? ((item.listedPrice || 0) > params.finalPrice ? (item.listedPrice || 0) - params.finalPrice : 0);

      const newSale: SaleRecord = {
        id: saleId,
        itemId: params.itemId,
        organizationId: item.organizationId || "org-default",
        buyerName: params.buyerName || "Cliente",
        buyerDoc: params.buyerDoc || "",
        buyerPhone: params.buyerPhone || "",
        buyerEmail: params.buyerEmail || "",
        platform: params.platform || "Venda Direta",
        saleDate: params.saleDate || new Date().toISOString().split("T")[0],
        listedPrice,
        negotiatedPrice,
        finalPrice: params.finalPrice,
        discount,
        sellerFreight,
        platformCommission,
        taxes,
        otherExpenses,
        paymentMethod: params.paymentMethod || "Pix",
        paymentStatus: params.paymentStatus || "pago",
        notes: params.notes || "",
        netSaleValue,
        costBasisAtSale: costBasis, // CMV congelado
        netProfit,
        roiPercentage,
        marginPercentage,
        previousItemStatus: item.status || "disponivel",
        createdAt: new Date().toISOString(),
      };

      transaction.set(saleRef, newSale);
      transaction.update(itemRef, {
        status: "vendido",
        isSold: true,
      });

      // Gravação no Ledger Imutável
      recordLedgerEntry(transaction, {
        organizationId: item.organizationId || "org-default",
        itemId: item.id,
        lotId: item.lotId || "",
        auctionId: item.auctionId || "",
        eventType: "SALE",
        description: `Venda concluída por R$ ${params.finalPrice.toFixed(2)} (${newSale.buyerName}). Lucro: R$ ${netProfit.toFixed(2)}.`,
        amountChange: netSaleValue,
        costBasis,
        marketEstimate: item.estimatedMarketAvg || 0,
        user: userRole === "admin" ? "Administrador" : userRole,
        metadata: { saleId },
      });

      // Log de Atividade
      const newLog: ActivityLog = {
        id: logId,
        organizationId: item.organizationId || "org-default",
        itemId: item.id,
        title: "Venda Realizada",
        description: `Vendido por R$ ${params.finalPrice.toFixed(2)} para ${newSale.buyerName}. Lucro Líquido: R$ ${netProfit.toFixed(2)} (ROI ${roiPercentage.toFixed(1)}%).`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: userRole === "admin" ? "Administrador" : userRole,
        type: "sale",
      };
      transaction.set(logRef, newLog);

      resultSale = newSale;
    });

    if (!resultSale) {
      throw new Error("Falha ao registrar venda.");
    }

    return { sale: resultSale, netProfit: resultNetProfit, roi: resultRoi };
  },

  /**
   * Reverte uma venda atômica no Firestore restaurando o status anterior do item e registrando a reversão no ledger.
   */
  async reverseSale(sale: SaleRecord, userRole: string = "admin"): Promise<void> {
    const saleRef = doc(db, "sales", sale.id);
    const itemRef = doc(db, "items", sale.itemId);

    await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      const restoredStatus = sale.previousItemStatus || "disponivel";

      if (itemSnap.exists()) {
        const item = itemSnap.data() as AuctionItem;
        transaction.update(itemRef, {
          status: restoredStatus,
          isSold: false,
        });

        // Registrar Reversão no Ledger
        recordLedgerEntry(transaction, {
          organizationId: item.organizationId || "org-default",
          itemId: item.id,
          lotId: item.lotId || "",
          auctionId: item.auctionId || "",
          eventType: "SALE_REVERSAL",
          description: `Estorno/Reversão de venda R$ ${(sale.finalPrice ?? 0).toFixed(2)}. Item retornado a ${restoredStatus}.`,
          amountChange: -(sale.netSaleValue ?? sale.finalPrice ?? 0),
          costBasis: sale.costBasisAtSale ?? item.realTotalCost ?? 0,
          marketEstimate: item.estimatedMarketAvg || 0,
          user: userRole === "admin" ? "Administrador" : userRole,
          metadata: { saleId: sale.id },
        });
      }

      transaction.delete(saleRef);
    });
  },
};
