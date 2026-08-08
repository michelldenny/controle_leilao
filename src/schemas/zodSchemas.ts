import { z } from "zod";

// Helper para validar CPF ou CNPJ (se informado)
export const validateCpfCnpj = (val?: string) => {
  if (!val || val.trim() === "") return true;
  const clean = val.replace(/\D/g, "");
  return clean.length === 11 || clean.length === 14;
};

// Schema de Leilão
export const auctionSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().optional(),
  name: z.string().min(3, "Nome do leilão deve ter pelo menos 3 caracteres"),
  auctioneer: z.string().min(2, "Leiloeiro é obrigatório"),
  platform: z.string().min(2, "Plataforma é obrigatória"),
  processNumber: z.string().optional(),
  responsibleEntity: z.string().optional(),
  auctionType: z.string().min(1, "Tipo de leilão é obrigatório"),
  auctionDate: z.string().min(1, "Data é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  pickupAddress: z.string().optional().default(""),
  commissionPercentage: z.number().min(0, "Comissão não pode ser negativa").max(100, "Comissão máxima de 100%"),
  notes: z.string().optional(),
  editalUrl: z.union([z.string().url("URL de edital inválida"), z.literal("")]).optional(),
  status: z.enum(["futuro", "participando", "concluido", "cancelado"]),
  documentsCount: z.number().optional(),
});

// Schema de Lote
export const lotSchema = z.object({
  id: z.string().optional(),
  auctionId: z.string().min(1, "Leilão vinculado é obrigatório"),
  lotNumber: z.string().min(1, "Número do lote é obrigatório"),
  description: z.string().min(3, "Descrição do lote é obrigatória"),
  winningBid: z.number().min(0, "Lance vencedor não pode ser negativo"),
  auctioneerCommission: z.number().min(0, "Comissão não pode ser negativa"),
  adminFee: z.number().min(0, "Taxa administrativa não pode ser negativa"),
  taxes: z.number().min(0, "Impostos não podem ser negativos"),
  transportCost: z.number().min(0, "Custo de transporte não pode ser negativo"),
  disassemblyCost: z.number().min(0, "Custo de desmontagem não pode ser negativo"),
  loadingCost: z.number().min(0, "Custo de carregamento não pode ser negativo"),
  storageCost: z.number().min(0, "Custo de armazenamento não pode ser negativo"),
  otherCosts: z.number().min(0, "Outros custos não podem ser negativos"),
  itemCount: z.number().int().min(1, "Lote deve conter pelo menos 1 item"),
  paymentDeadline: z.string().min(1, "Prazo de pagamento é obrigatório"),
  pickupDeadline: z.string().min(1, "Prazo de retirada é obrigatório"),
  paymentStatus: z.enum(["pendente", "pago_parcial", "pago", "atrasado"]),
  pickupStatus: z.enum(["aguardando", "em_transporte", "retirado"]),
  notes: z.string().optional(),
});

// Schema de Item do Leilão
export const auctionItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  lotId: z.string().min(1, "Lote vinculado é obrigatório"),
  auctionId: z.string().min(1, "Leilão vinculado é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().optional(),
  name: z.string().min(2, "Nome do item é obrigatório"),
  description: z.string().optional().default(""),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  formerAssetTag: z.string().optional(),
  quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
  condition: z.enum(["novo", "seminovo", "usado", "avariado", "sucata", "nao_testado"]),
  operationalState: z.enum(["funcionando", "parcialmente_funcionando", "nao_funcionando", "nao_testado"]),
  location: z.object({
    warehouse: z.string().optional(),
    pavilion: z.string().optional(),
    aisle: z.string().optional(),
    shelfUnit: z.string().optional(),
    shelfTier: z.string().optional(),
    position: z.string().optional(),
    customText: z.string().optional().default(""),
  }),
  photos: z.array(z.string()).optional().default([]),
  primaryPhoto: z.string().optional().default(""),
  status: z.enum([
    "aguardando_retirada",
    "em_transporte",
    "recebido",
    "armazenado",
    "nao_testado",
    "em_avaliacao",
    "em_manutencao",
    "disponivel",
    "anunciado",
    "reservado",
    "uso_proprio",
    "vendido",
    "descartado",
  ]),
  originalCost: z.number().min(0, "Custo não pode ser negativo"),
  apportionedCost: z.number().min(0),
  additionalCosts: z.number().min(0),
  realTotalCost: z.number().min(0),
  estimatedMarketMin: z.number().min(0),
  estimatedMarketAvg: z.number().min(0),
  estimatedMarketMax: z.number().min(0),
  isAdvertised: z.boolean(),
  isSold: z.boolean(),
  dateAdded: z.string(),
});

// Schema de Registro de Venda
export const saleRecordSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, "Item é obrigatório"),
  buyerName: z.string().min(2, "Nome do comprador é obrigatório"),
  buyerDoc: z.string().optional().or(z.literal("")).refine(validateCpfCnpj, "CPF ou CNPJ inválido"),
  buyerPhone: z.string().optional().or(z.literal("")),
  buyerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  platform: z.string().min(1, "Plataforma de venda é obrigatória"),
  saleDate: z.string().min(1, "Data de venda é obrigatória"),
  listedPrice: z.number().min(0).optional(),
  negotiatedPrice: z.number().min(0).optional(),
  finalPrice: z.number().min(0, "Preço final deve ser maior ou igual a zero"),
  discount: z.number().min(0).optional(),
  sellerFreight: z.number().min(0).optional().default(0),
  platformCommission: z.number().min(0).optional().default(0),
  taxes: z.number().min(0).optional().default(0),
  otherExpenses: z.number().min(0).optional().default(0),
  paymentMethod: z.string().optional().default("Pix"),
  paymentStatus: z.enum(["pago", "pendente", "parcelado"]).optional().default("pago"),
  notes: z.string().optional().or(z.literal("")),
});

// Schema de Despesa Adicional
export const additionalExpenseSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, "Item vinculado é obrigatório"),
  category: z.string().min(1, "Categoria de despesa é obrigatória"),
  description: z.string().min(2, "Descrição da despesa é obrigatória"),
  amount: z.number().positive("Valor da despesa deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  supplier: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});
