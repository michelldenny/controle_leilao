import { doc, runTransaction } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AdditionalExpense, MaintenanceRecord, AuctionItem, OperationalState } from "../types";
import { additionalExpenseSchema } from "../schemas/zodSchemas";
import { roundToCents } from "./financialMath";
import { recordLedgerEntry } from "./ledgerService";

export const InventoryService = {
  /**
   * Adiciona uma nova despesa a um item atualizando o custo total atômica e transacionalmente.
   */
  async addExpense(expenseData: Omit<AdditionalExpense, "id">, userRole: string = "admin"): Promise<AdditionalExpense> {
    const parseRes = additionalExpenseSchema.safeParse(expenseData);
    if (!parseRes.success) {
      const issues = (parseRes as any).error?.issues || [];
      const msg = issues[0]?.message || "Dados de despesa inválidos";
      throw new Error(msg);
    }

    const expId = "exp-" + crypto.randomUUID();
    const logId = "log-" + crypto.randomUUID();
    const expRef = doc(db, "expenses", expId);
    const itemRef = doc(db, "items", expenseData.itemId);

    let createdExp: AdditionalExpense | null = null;

    await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) throw new Error("Item não encontrado.");

      const item = itemSnap.data() as AuctionItem;
      const newAdditionalCosts = roundToCents((item.additionalCosts || 0) + expenseData.amount);
      const newRealTotalCost = roundToCents((item.apportionedCost || 0) + newAdditionalCosts);

      const newExp: AdditionalExpense = {
        ...expenseData,
        id: expId,
        organizationId: item.organizationId || "org-default",
        createdAt: new Date().toISOString(),
      };

      transaction.set(expRef, newExp);
      transaction.update(itemRef, {
        additionalCosts: newAdditionalCosts,
        realTotalCost: newRealTotalCost,
      });

      // Registrar Evento de Despesa Adicional no Ledger Imutável
      recordLedgerEntry(transaction, {
        organizationId: item.organizationId || "org-default",
        itemId: item.id,
        lotId: item.lotId,
        auctionId: item.auctionId,
        eventType: "ADDITIONAL_EXPENSE",
        description: `Despesa adicional: R$ ${expenseData.amount.toFixed(2)} (${expenseData.description}).`,
        amountChange: expenseData.amount,
        costBasis: newRealTotalCost,
        marketEstimate: item.estimatedMarketAvg || 0,
        user: userRole === "admin" ? "Administrador" : userRole,
      });

      createdExp = newExp;
    });

    if (!createdExp) throw new Error("Falha ao salvar despesa.");
    return createdExp;
  },

  /**
   * Adiciona um registro de manutenção ao item, criando a despesa correspondente e atualizando o status atômica e transacionalmente.
   */
  async addMaintenance(maintData: Omit<MaintenanceRecord, "id">, userRole: string = "admin"): Promise<MaintenanceRecord> {
    const maintId = "maint-" + crypto.randomUUID();
    const expId = maintData.cost > 0 ? "exp-" + crypto.randomUUID() : undefined;

    const maintRef = doc(db, "maintenanceRecords", maintId);
    const itemRef = doc(db, "items", maintData.itemId);

    let createdMaint: MaintenanceRecord | null = null;

    await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) throw new Error("Item não encontrado.");

      const item = itemSnap.data() as AuctionItem;
      const newMaint: MaintenanceRecord = {
        ...maintData,
        id: maintId,
        organizationId: item.organizationId || "org-default",
        expenseId: expId,
      };
      transaction.set(maintRef, newMaint);

      let newAdditionalCosts = item.additionalCosts || 0;
      let newRealTotalCost = item.realTotalCost || 0;

      if (maintData.cost > 0 && expId) {
        const expRef = doc(db, "expenses", expId);
        const newExp: AdditionalExpense = {
          id: expId,
          organizationId: item.organizationId || "org-default",
          itemId: maintData.itemId,
          category: "Manutenção",
          description: `Serviço: ${maintData.serviceType}`,
          amount: maintData.cost,
          date: maintData.date,
          supplier: maintData.supplier,
          createdAt: new Date().toISOString(),
        };
        transaction.set(expRef, newExp);
        newAdditionalCosts = roundToCents(newAdditionalCosts + maintData.cost);
        newRealTotalCost = roundToCents((item.apportionedCost || 0) + newAdditionalCosts);
      }

      transaction.update(itemRef, {
        status: "em_manutencao",
        additionalCosts: newAdditionalCosts,
        realTotalCost: newRealTotalCost,
      });

      // Gravação no Ledger
      recordLedgerEntry(transaction, {
        organizationId: item.organizationId || "org-default",
        itemId: item.id,
        lotId: item.lotId,
        auctionId: item.auctionId,
        eventType: "MAINTENANCE_START",
        description: `Início de manutenção: ${maintData.serviceType} (Custo R$ ${maintData.cost.toFixed(2)}).`,
        amountChange: maintData.cost,
        costBasis: newRealTotalCost,
        marketEstimate: item.estimatedMarketAvg || 0,
        user: userRole === "admin" ? "Administrador" : userRole,
      });

      createdMaint = newMaint;
    });

    if (!createdMaint) throw new Error("Falha ao registrar manutenção.");
    return createdMaint;
  },

  /**
   * Conclui o status da manutenção e atualiza o estado operacional do item.
   */
  async updateMaintenanceStatus(
    id: string,
    existingMaint: MaintenanceRecord,
    status: MaintenanceRecord["status"],
    newOperationalState?: OperationalState
  ): Promise<void> {
    const maintRef = doc(db, "maintenanceRecords", id);
    const itemRef = doc(db, "items", existingMaint.itemId);

    await runTransaction(db, async (transaction) => {
      transaction.update(maintRef, { status });
      if (status === "concluida") {
        transaction.update(itemRef, {
          status: "disponivel",
          operationalState: newOperationalState || "funcionando",
        });
      }
    });
  },
};
