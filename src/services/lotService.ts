import { doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Lot, AuctionItem, ApportionmentMethod } from "../types";
import { apportionLotCostExact } from "./financialMath";

/**
 * Serviço de gerenciamento de Lotes e Rateio de Custos.
 */
export const LotService = {
  /**
   * Executa o rateio atômico de custos de um lote entre seus itens ativos em estoque.
   */
  async applyApportionment(
    targetLot: Lot,
    lotItems: AuctionItem[],
    method: ApportionmentMethod,
    customValues?: { itemId: string; value: number }[]
  ): Promise<void> {
    const totalLotCost = targetLot.totalLotCost || 0;
    const apportionmentResults = apportionLotCostExact(totalLotCost, lotItems, method, customValues);

    if (apportionmentResults.length === 0) {
      throw new Error("Não há itens ativos disponíveis no estoque para absorver o rateio deste lote.");
    }

    const batch = writeBatch(db);

    apportionmentResults.forEach((res) => {
      const itemRef = doc(db, "items", res.itemId);
      batch.update(itemRef, {
        apportionedCost: res.apportionedCost,
        assignedPercent: res.assignedPercent,
        realTotalCost: res.realTotalCost,
        costAllocationStatus: "concluido",
      });
    });

    const lotRef = doc(db, "lots", targetLot.id);
    batch.update(lotRef, {
      allocationStatus: "concluido",
      apportionmentMethod: method,
      allocationVersion: (targetLot.allocationVersion || 1) + 1,
      allocatedTotal: totalLotCost,
      unallocatedAmount: 0,
    });

    await batch.commit();
  },
};
