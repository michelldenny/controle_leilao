export type LedgerEventType =
  | "ACQUISITION"
  | "COST_APPORTIONMENT"
  | "ADDITIONAL_EXPENSE"
  | "MAINTENANCE_START"
  | "MAINTENANCE_END"
  | "SALE"
  | "SALE_REVERSAL"
  | "DISCARD"
  | "OWN_USE_RETENTION";

export interface StockLedgerEntry {
  id: string;
  organizationId: string;
  itemId: string;
  lotId?: string;
  auctionId?: string;
  eventType: LedgerEventType;
  description: string;
  amountChange: number;
  costBasis: number;
  marketEstimate: number;
  user: string;
  timestamp: string; // ISO 8601 UTC
  metadata?: Record<string, any>;
}
