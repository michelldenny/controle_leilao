import { doc, Transaction } from "firebase/firestore";
import { db } from "../lib/firebase";
import { StockLedgerEntry, LedgerEventType } from "../types/ledger";

/**
 * Serviço especializado na gravação de eventos imutáveis no ledger de movimentações do estoque.
 */
export const recordLedgerEntry = (
  transaction: Transaction,
  params: {
    organizationId?: string;
    itemId: string;
    lotId?: string;
    auctionId?: string;
    eventType: LedgerEventType;
    description: string;
    amountChange: number;
    costBasis: number;
    marketEstimate: number;
    user: string;
    metadata?: Record<string, any>;
  }
) => {
  const ledgerId = "led-" + crypto.randomUUID();
  const ledgerRef = doc(db, "stockLedger", ledgerId);

  const entry: StockLedgerEntry = {
    id: ledgerId,
    organizationId: params.organizationId || "org-default",
    itemId: params.itemId,
    lotId: params.lotId || "",
    auctionId: params.auctionId || "",
    eventType: params.eventType,
    description: params.description,
    amountChange: params.amountChange ?? 0,
    costBasis: params.costBasis ?? 0,
    marketEstimate: params.marketEstimate ?? 0,
    user: params.user || "Sistema",
    timestamp: new Date().toISOString(),
    metadata: params.metadata || {},
  };

  transaction.set(ledgerRef, entry);
  return entry;
};
