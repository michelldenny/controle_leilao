export type AuctionStatus = "futuro" | "participando" | "concluido" | "cancelado";

export type LotPaymentStatus = "pendente" | "pago_parcial" | "pago" | "atrasado";
export type LotPickupStatus = "aguardando" | "em_transporte" | "retirado";

export type ItemCondition = "novo" | "seminovo" | "usado" | "avariado" | "sucata" | "nao_testado";
export type OperationalState = "funcionando" | "parcialmente_funcionando" | "nao_funcionando" | "nao_testado";

export type ItemStatus =
  | "aguardando_retirada"
  | "em_transporte"
  | "recebido"
  | "armazenado"
  | "nao_testado"
  | "em_avaliacao"
  | "em_manutencao"
  | "disponivel"
  | "anunciado"
  | "reservado"
  | "vendido"
  | "descartado";

export type ApportionmentMethod = "igualitario" | "manual" | "percentual" | "valor_estimado";

export type MaintenanceStatus = "aguardando" | "em_manutencao" | "concluida" | "nao_compensa";

export type AdPlatform =
  | "Mercado Livre"
  | "OLX"
  | "Webmotors"
  | "Facebook Marketplace"
  | "Shopee"
  | "Instagram"
  | "Loja própria"
  | "Venda direta"
  | "Outro";

export type AdStatus = "preparando" | "publicado" | "pausado" | "vendido" | "encerrado";

export type ContactType =
  | "comprador"
  | "fornecedor"
  | "transportadora"
  | "tecnico"
  | "prestador"
  | "leiloeiro"
  | "prestador_servico"
  | "fornecedor_pecas";

export type DocType =
  | "edital"
  | "nota_arrematacao"
  | "comprovante"
  | "nota_fiscal"
  | "recibo"
  | "orcamento"
  | "contrato"
  | "termo_retirada"
  | "outros";

export type UserRole = "admin" | "operador" | "financeiro" | "consulta";

export interface Auction {
  id: string;
  name: string;
  auctioneer: string;
  platform: string;
  processNumber?: string;
  responsibleEntity?: string;
  auctionType: string; // Judicial, Extrajudicial, Corporativo
  auctionDate: string;
  city: string;
  state: string;
  pickupAddress: string;
  commissionPercentage: number;
  notes?: string;
  editalUrl?: string;
  status: AuctionStatus;
  documentsCount?: number;
}

export interface Lot {
  id: string;
  auctionId: string;
  lotNumber: string;
  description: string;
  winningBid: number; // lance vencedor
  auctioneerCommission: number;
  adminFee: number;
  taxes: number;
  transportCost: number;
  disassemblyCost: number;
  loadingCost: number;
  storageCost: number;
  otherCosts: number;
  totalLotCost: number; // calculated sum
  itemCount: number;
  paymentDeadline: string;
  pickupDeadline: string;
  paymentStatus: LotPaymentStatus;
  pickupStatus: LotPickupStatus;
  notes?: string;
}

export interface AuctionItem {
  id: string;
  code: string; // e.g. L2026-001
  qrCodeUrl?: string;
  lotId: string;
  auctionId: string;
  category: string;
  subcategory?: string;
  name: string;
  description: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  formerAssetTag?: string; // patrimônio anterior
  quantity: number;
  condition: ItemCondition;
  operationalState: OperationalState;
  location: {
    warehouse?: string;
    pavilion?: string;
    aisle?: string;
    shelfUnit?: string;
    shelfTier?: string;
    position?: string;
    customText: string;
  };
  photos: string[];
  primaryPhoto: string;
  status: ItemStatus;
  originalCost: number;
  assignedPercent?: number;
  apportionedCost: number; // cost assigned from lot
  additionalCosts: number; // expenses accumulated
  realTotalCost: number; // apportionedCost + additionalCosts
  estimatedMarketMin: number;
  estimatedMarketAvg: number;
  estimatedMarketMax: number;
  evaluationSource?: string;
  evaluationDate?: string;
  evaluationLinks?: string;
  evaluationNotes?: string;
  listedPrice?: number;
  isAdvertised: boolean;
  isSold: boolean;
  dateAdded: string;
  daysInStock?: number;
  archived?: boolean;
}

export interface AdditionalExpense {
  id: string;
  itemId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  supplier?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  itemId: string;
  serviceType: string;
  description: string;
  date: string;
  responsible: string;
  supplier?: string;
  cost: number;
  partsUsed?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  status: MaintenanceStatus;
  notes?: string;
}

export interface MarketEvaluation {
  id: string;
  itemId: string;
  minVal: number;
  avgVal: number;
  maxVal: number;
  source: string;
  date: string;
  links?: string;
  notes?: string;
}

export interface Advertisement {
  id: string;
  itemId: string;
  platform: AdPlatform;
  url?: string;
  listedPrice: number;
  publishDate: string;
  adCost: number;
  status: AdStatus;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  buyerName: string;
  buyerDoc?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  platform: string;
  saleDate: string;
  listedPrice: number;
  negotiatedPrice: number;
  finalPrice: number; // gross received
  discount: number;
  sellerFreight: number;
  platformCommission: number;
  taxes: number;
  otherExpenses: number;
  netSaleValue: number; // finalPrice - sellerFreight - platformCommission - taxes - otherExpenses
  netProfit: number; // netSaleValue - realTotalCost
  roiPercentage: number; // (netProfit / realTotalCost) * 100
  marginPercentage: number; // (netProfit / netSaleValue) * 100
  paymentMethod: string; // PIX, Cartão, Boleto, Dinheiro
  paymentStatus: "pago" | "pendente" | "parcelado";
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  company?: string;
  companyName?: string;
  docType?: "CPF" | "CNPJ";
  docNumber?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  contactType?: ContactType;
  type?: ContactType;
  notes?: string;
}

export interface AppDocument {
  id: string;
  title: string;
  docType: DocType;
  entityType: "auction" | "lot" | "item" | "sale";
  entityId: string;
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string;
  notes?: string;
  type?: string;
  dateUploaded?: string;
  origin?: string;
}

export interface ActivityLog {
  id: string;
  itemId?: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  type: "creation" | "status_change" | "location_change" | "expense" | "maintenance" | "evaluation" | "ad" | "sale" | "system";
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "info";
  dueDate?: string;
  relatedType?: "lot" | "item" | "ad";
  relatedId?: string;
}
