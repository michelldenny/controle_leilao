export type ItemSealId = "prime" | "premium" | "excelente" | "muito_bom" | "bom" | "oportunidade";

export interface ItemSeal {
  id: ItemSealId;
  name: string;
  emoji: string;
  description: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  lightBgClass: string;
}

export const ITEM_SEALS: Record<ItemSealId, ItemSeal> = {
  prime: {
    id: "prime",
    name: "Prime",
    emoji: "🟣",
    description: "Estado impecável, praticamente novo.",
    badgeBgClass: "bg-purple-100",
    badgeTextClass: "text-purple-800",
    badgeBorderClass: "border-purple-300",
    lightBgClass: "bg-purple-50",
  },
  premium: {
    id: "premium",
    name: "Premium",
    emoji: "🟢",
    description: "Pequenos detalhes estéticos quase imperceptíveis.",
    badgeBgClass: "bg-emerald-100",
    badgeTextClass: "text-emerald-800",
    badgeBorderClass: "border-emerald-300",
    lightBgClass: "bg-emerald-50",
  },
  excelente: {
    id: "excelente",
    name: "Excelente",
    emoji: "🔵",
    description: "Marcas leves de uso, funcionamento perfeito.",
    badgeBgClass: "bg-blue-100",
    badgeTextClass: "text-blue-800",
    badgeBorderClass: "border-blue-300",
    lightBgClass: "bg-blue-50",
  },
  muito_bom: {
    id: "muito_bom",
    name: "Muito Bom",
    emoji: "🟡",
    description: "Sinais visíveis de uso, excelente custo-benefício.",
    badgeBgClass: "bg-yellow-100",
    badgeTextClass: "text-yellow-800",
    badgeBorderClass: "border-yellow-300",
    lightBgClass: "bg-yellow-50",
  },
  bom: {
    id: "bom",
    name: "Bom",
    emoji: "🟠",
    description: "Desgaste estético evidente, funcionamento perfeito.",
    badgeBgClass: "bg-orange-100",
    badgeTextClass: "text-orange-800",
    badgeBorderClass: "border-orange-300",
    lightBgClass: "bg-orange-50",
  },
  oportunidade: {
    id: "oportunidade",
    name: "Oportunidade",
    emoji: "🔴",
    description: "Produto funcional com detalhes relevantes ou incompleto, refletidos no preço.",
    badgeBgClass: "bg-red-100",
    badgeTextClass: "text-red-800",
    badgeBorderClass: "border-red-300",
    lightBgClass: "bg-red-50",
  },
};

export const ITEM_SEALS_LIST = Object.values(ITEM_SEALS);
