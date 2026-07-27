import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Auction,
  Lot,
  AuctionItem,
  AdditionalExpense,
  MaintenanceRecord,
  MarketEvaluation,
  Advertisement,
  SaleRecord,
  Contact,
  AppDocument,
  ActivityLog,
  AlertItem,
  UserRole,
  ApportionmentMethod,
  ItemStatus,
  ItemCondition,
  OperationalState,
} from "../types";
import {
  initialAuctions,
  initialLots,
  initialItems,
  initialExpenses,
  initialMaintenanceRecords,
  initialAdvertisements,
  initialSales,
  initialContacts,
  initialDocuments,
  initialActivityLogs,
  initialAlerts,
} from "../mockData";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface AuctionContextType {
  // Theme & User Role
  darkMode: boolean;
  toggleDarkMode: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Active View
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  openItemDetail: (itemId: string) => void;

  // Modals state
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  isBulkModalOpen: boolean;
  setIsBulkModalOpen: (open: boolean) => void;
  isApportionmentModalOpen: boolean;
  setIsApportionmentModalOpen: (open: boolean) => void;
  selectedLotForApportionment: Lot | null;
  openApportionmentModal: (lot: Lot) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalItem: AuctionItem | null;
  openAiModal: (item?: AuctionItem) => void;
  closeAiModal: () => void;

  // Core Data Lists
  auctions: Auction[];
  lots: Lot[];
  items: AuctionItem[];
  expenses: AdditionalExpense[];
  maintenanceRecords: MaintenanceRecord[];
  advertisements: Advertisement[];
  sales: SaleRecord[];
  contacts: Contact[];
  documents: AppDocument[];
  activityLogs: ActivityLog[];
  alerts: AlertItem[];
  toasts: ToastMessage[];

  // CRUD & Operations
  addAuction: (auction: Omit<Auction, "id">) => Auction;
  updateAuction: (id: string, auction: Partial<Auction>) => void;
  deleteAuction: (id: string) => void;
  addLot: (lot: Omit<Lot, "id" | "totalLotCost">) => Lot;
  updateLot: (id: string, lot: Partial<Lot>) => void;
  deleteLot: (id: string) => void;
  addItem: (item: Omit<AuctionItem, "id" | "code" | "dateAdded" | "realTotalCost">) => AuctionItem;
  updateItem: (id: string, item: Partial<AuctionItem>) => void;
  deleteItem: (id: string) => void;
  archiveItem: (id: string) => void;
  apportionLotCost: (
    lotId: string,
    method: ApportionmentMethod,
    customValues?: { itemId: string; value: number }[]
  ) => void;
  bulkCreateItems: (
    lotId: string,
    count: number,
    baseData: {
      name: string;
      category: string;
      subcategory?: string;
      brand?: string;
      model?: string;
      condition: ItemCondition;
      operationalState: OperationalState;
      locationText: string;
      estimatedMarketAvg?: number;
    }
  ) => void;
  addMultipleItems: (params: {
    auctionId: string;
    lotId: string;
    baseName: string;
    category: string;
    condition?: ItemCondition;
    quantity: number;
    unitApportionedCost: number;
    unitEstimatedValue: number;
    photoUrl?: string;
  }) => void;

  // Expense & Maintenance & Sales
  addExpense: (expense: Omit<AdditionalExpense, "id">) => void;
  addMaintenance: (maint: Omit<MaintenanceRecord, "id">) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceRecord["status"]) => void;
  addAdvertisement: (ad: Omit<Advertisement, "id">) => void;
  updateAdStatus: (id: string, status: Advertisement["status"]) => void;
  deleteAdvertisement: (id: string) => void;
  recordSale: (sale: Omit<SaleRecord, "id" | "netSaleValue" | "netProfit" | "roiPercentage" | "marginPercentage">) => void;

  // Contacts & Documents
  addContact: (contact: Omit<Contact, "id">) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addDocument: (doc: Omit<AppDocument, "id" | "uploadDate">) => void;
  updateDocument: (id: string, doc: Partial<AppDocument>) => void;
  deleteDocument: (id: string) => void;

  // Toast / Alerts
  addToast: (title: string, message: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;

  // Search & Global Filters
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Financial Metrics & Calculated Summaries
  metrics: {
    totalInvested: number;
    totalEstimatedMarket: number;
    totalSoldAmount: number;
    realizedProfit: number;
    potentialProfit: number;
    totalItemsCount: number;
    availableItemsCount: number;
    soldItemsCount: number;
    awaitingPickupCount: number;
    inMaintenanceCount: number;
    advertisedCount: number;
    unassessedCount: number;
    capitalInInventoryCost: number;
    capitalInInventoryEstimated: number;
    potentialStockProfit: number;
  };
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization with LocalStorage fallbacks
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("leilao_theme") === "dark";
  });

  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isApportionmentModalOpen, setIsApportionmentModalOpen] = useState<boolean>(false);
  const [selectedLotForApportionment, setSelectedLotForApportionment] = useState<Lot | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalItem, setAiModalItem] = useState<AuctionItem | null>(null);

  // Entities Data
  const [auctions, setAuctions] = useState<Auction[]>(() => {
    const saved = localStorage.getItem("leilao_auctions");
    return saved ? JSON.parse(saved) : initialAuctions;
  });

  const [lots, setLots] = useState<Lot[]>(() => {
    const saved = localStorage.getItem("leilao_lots");
    return saved ? JSON.parse(saved) : initialLots;
  });

  const [items, setItems] = useState<AuctionItem[]>(() => {
    const saved = localStorage.getItem("leilao_items");
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [expenses, setExpenses] = useState<AdditionalExpense[]>(() => {
    const saved = localStorage.getItem("leilao_expenses");
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem("leilao_maintenance");
    return saved ? JSON.parse(saved) : initialMaintenanceRecords;
  });

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem("leilao_advertisements");
    return saved ? JSON.parse(saved) : initialAdvertisements;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem("leilao_sales");
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem("leilao_contacts");
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [documents, setDocuments] = useState<AppDocument[]>(() => {
    const saved = localStorage.getItem("leilao_documents");
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("leilao_activity_logs");
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem("leilao_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("leilao_auctions", JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem("leilao_lots", JSON.stringify(lots));
  }, [lots]);

  useEffect(() => {
    localStorage.setItem("leilao_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("leilao_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("leilao_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("leilao_activity_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Theme toggle
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Toast notifications
  const addToast = (title: string, message: string, type: ToastMessage["type"] = "success") => {
    const id = "toast-" + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (title: string, description: string, type: ActivityLog["type"], itemId?: string) => {
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      itemId,
      title,
      description,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      user: userRole === "admin" ? "Administrador" : userRole,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const openItemDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    setActiveTab("item-detail");
  };

  const openApportionmentModal = (lot: Lot) => {
    setSelectedLotForApportionment(lot);
    setIsApportionmentModalOpen(true);
  };

  const openAiModal = (item?: AuctionItem) => {
    setAiModalItem(item || null);
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setAiModalItem(null);
  };

  // Helper calculate total lot cost
  const calculateTotalLotCost = (l: Omit<Lot, "id" | "totalLotCost"> | Lot): number => {
    return (
      (l.winningBid || 0) +
      (l.auctioneerCommission || 0) +
      (l.adminFee || 0) +
      (l.taxes || 0) +
      (l.transportCost || 0) +
      (l.disassemblyCost || 0) +
      (l.loadingCost || 0) +
      (l.storageCost || 0) +
      (l.otherCosts || 0)
    );
  };

  // CRUD Auctions
  const addAuction = (auctionData: Omit<Auction, "id">): Auction => {
    const id = "auc-" + (auctions.length + 1) + "-" + Date.now().toString(36);
    const newAuction: Auction = { ...auctionData, id };
    setAuctions((prev) => [newAuction, ...prev]);
    addToast("Leilão Cadastrado", `Leilão "${newAuction.name}" adicionado com sucesso!`);
    addLog("Novo Leilão", `Leilão ${newAuction.name} cadastrado.`, "creation");
    return newAuction;
  };

  const updateAuction = (id: string, auctionData: Partial<Auction>) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, ...auctionData } : a)));
    addToast("Leilão Atualizado", "As informações do leilão foram atualizadas.");
  };

  const deleteAuction = (id: string) => {
    setAuctions((prev) => prev.filter((a) => a.id !== id));
    addToast("Leilão Excluído", "O leilão foi removido do sistema.");
  };

  // CRUD Lots
  const addLot = (lotData: Omit<Lot, "id" | "totalLotCost">): Lot => {
    const id = "lot-" + (lots.length + 1) + "-" + Date.now().toString(36);
    const totalLotCost = calculateTotalLotCost(lotData);
    const newLot: Lot = { ...lotData, id, totalLotCost };
    setLots((prev) => [newLot, ...prev]);
    addToast("Lote Cadastrado", `Lote ${newLot.lotNumber} adicionado com custo total de R$ ${totalLotCost.toFixed(2)}.`);
    addLog("Novo Lote", `Lote ${newLot.lotNumber} cadastrado com valor de lance R$ ${newLot.winningBid.toFixed(2)}.`, "creation");
    return newLot;
  };

  const updateLot = (id: string, lotData: Partial<Lot>) => {
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...lotData };
          updated.totalLotCost = calculateTotalLotCost(updated);
          return updated;
        }
        return l;
      })
    );
    addToast("Lote Atualizado", "Dados do lote atualizados com sucesso.");
  };

  const deleteLot = (id: string) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
    addToast("Lote Excluído", "O lote foi removido do sistema.");
  };

  // CRUD Items
  const addItem = (
    itemData: Omit<AuctionItem, "id" | "code" | "dateAdded" | "realTotalCost">
  ): AuctionItem => {
    const nextSeq = items.length + 1;
    const code = `LEIL-2026-${nextSeq.toString().padStart(3, "0")}`;
    const id = "itm-" + nextSeq + "-" + Date.now().toString(36);
    const realTotalCost = (itemData.apportionedCost || 0) + (itemData.additionalCosts || 0);
    const dateAdded = new Date().toISOString().split("T")[0];

    const newItem: AuctionItem = {
      ...itemData,
      id,
      code,
      realTotalCost,
      dateAdded,
      daysInStock: 0,
      archived: false,
    };

    setItems((prev) => [newItem, ...prev]);

    // Update itemCount in Lot
    setLots((prev) =>
      prev.map((l) => (l.id === newItem.lotId ? { ...l, itemCount: l.itemCount + 1 } : l))
    );

    addToast("Item Cadastrado", `Item ${newItem.code} - ${newItem.name} adicionado ao inventário.`);
    addLog("Novo Item", `Item ${newItem.name} (${newItem.code}) cadastrado no lote.`, "creation", newItem.id);

    return newItem;
  };

  const updateItem = (id: string, itemData: Partial<AuctionItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, ...itemData };
          updated.realTotalCost = (updated.apportionedCost || 0) + (updated.additionalCosts || 0);

          if (itemData.status && itemData.status !== it.status) {
            addLog("Status Alterado", `Status do item ${it.code} alterado para ${itemData.status}.`, "status_change", id);
          }
          if (itemData.location && JSON.stringify(itemData.location) !== JSON.stringify(it.location)) {
            addLog("Localização Alterada", `Localização do item ${it.code} atualizada para ${itemData.location.customText}.`, "location_change", id);
          }

          return updated;
        }
        return it;
      })
    );
    addToast("Item Atualizado", "Alterações salvas com sucesso.");
  };

  const deleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    addToast("Item Removido", `O item ${target?.code || ""} foi excluído.`);
    addLog("Exclusão de Item", `Item ${target?.code} (${target?.name}) foi removido.`, "system");
  };

  const archiveItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, archived: true } : i))
    );
    addToast("Item Arquivado", "O item foi movido para os arquivos sem perder o histórico.");
  };

  // Apportionment Logic (Rateio do custo do lote)
  const apportionLotCost = (
    lotId: string,
    method: ApportionmentMethod,
    customValues?: { itemId: string; value: number }[]
  ) => {
    const targetLot = lots.find((l) => l.id === lotId);
    if (!targetLot) return;

    const lotItems = items.filter((i) => i.lotId === lotId);
    if (lotItems.length === 0) {
      addToast("Aviso de Rateio", "Não há itens cadastrados neste lote para ratear o custo.", "warning");
      return;
    }

    const totalLotCost = targetLot.totalLotCost;

    setItems((prev) =>
      prev.map((item) => {
        if (item.lotId !== lotId) return item;

        let apportioned = 0;
        let assignedPercent = 0;

        if (method === "igualitario") {
          apportioned = totalLotCost / lotItems.length;
          assignedPercent = 100 / lotItems.length;
        } else if (method === "percentual" && customValues) {
          const match = customValues.find((c) => c.itemId === item.id);
          assignedPercent = match ? match.value : 0;
          apportioned = (totalLotCost * assignedPercent) / 100;
        } else if (method === "manual" && customValues) {
          const match = customValues.find((c) => c.itemId === item.id);
          apportioned = match ? match.value : 0;
          assignedPercent = totalLotCost > 0 ? (apportioned / totalLotCost) * 100 : 0;
        } else if (method === "valor_estimado") {
          const sumEstimated = lotItems.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 1), 0);
          const itemEst = item.estimatedMarketAvg || 1;
          assignedPercent = sumEstimated > 0 ? (itemEst / sumEstimated) * 100 : 100 / lotItems.length;
          apportioned = (totalLotCost * assignedPercent) / 100;
        }

        const realTotalCost = apportioned + (item.additionalCosts || 0);

        return {
          ...item,
          apportionedCost: Number(apportioned.toFixed(2)),
          assignedPercent: Number(assignedPercent.toFixed(2)),
          realTotalCost: Number(realTotalCost.toFixed(2)),
        };
      })
    );

    addToast("Rateio Concluído", `Custo total de R$ ${totalLotCost.toFixed(2)} rateado entre ${lotItems.length} itens (${method}).`);
    addLog("Rateio de Custo", `Rateio de custo (${method}) aplicado no lote ${targetLot.lotNumber}.`, "expense");
  };

  // Bulk Item Generator (Cadastro em Massa)
  const bulkCreateItems = (
    lotId: string,
    count: number,
    baseData: {
      name: string;
      category: string;
      subcategory?: string;
      brand?: string;
      model?: string;
      condition: ItemCondition;
      operationalState: OperationalState;
      locationText: string;
      estimatedMarketAvg?: number;
    }
  ) => {
    const targetLot = lots.find((l) => l.id === lotId);
    if (!targetLot) return;

    const newCreatedItems: AuctionItem[] = [];
    const startSeq = items.length + 1;
    const dateAdded = new Date().toISOString().split("T")[0];

    // Simple default photo depending on category
    let defaultPhoto = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80";
    if (baseData.category === "Veículos") {
      defaultPhoto = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80";
    } else if (baseData.category === "Máquinas e Equipamentos") {
      defaultPhoto = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80";
    }

    const apportionedCostEach = Number((targetLot.totalLotCost / Math.max(count, 1)).toFixed(2));

    for (let i = 0; i < count; i++) {
      const seq = startSeq + i;
      const code = `LEIL-2026-${seq.toString().padStart(3, "0")}`;
      const id = "itm-" + seq + "-" + Date.now().toString(36) + "-" + i;

      const item: AuctionItem = {
        id,
        code,
        lotId,
        auctionId: targetLot.auctionId,
        category: baseData.category,
        subcategory: baseData.subcategory,
        name: `${baseData.name} #${i + 1}`,
        description: `${baseData.name} gerado via cadastro em massa para o Lote ${targetLot.lotNumber}.`,
        brand: baseData.brand,
        model: baseData.model,
        quantity: 1,
        condition: baseData.condition,
        operationalState: baseData.operationalState,
        location: {
          customText: baseData.locationText || "Depósito Central",
        },
        photos: [defaultPhoto],
        primaryPhoto: defaultPhoto,
        status: "armazenado",
        originalCost: apportionedCostEach,
        assignedPercent: Number((100 / count).toFixed(2)),
        apportionedCost: apportionedCostEach,
        additionalCosts: 0,
        realTotalCost: apportionedCostEach,
        estimatedMarketMin: (baseData.estimatedMarketAvg || 0) * 0.85,
        estimatedMarketAvg: baseData.estimatedMarketAvg || 0,
        estimatedMarketMax: (baseData.estimatedMarketAvg || 0) * 1.15,
        isAdvertised: false,
        isSold: false,
        dateAdded,
        daysInStock: 0,
        archived: false,
      };

      newCreatedItems.push(item);
    }

    setItems((prev) => [...newCreatedItems, ...prev]);

    // Update lot item count
    setLots((prev) =>
      prev.map((l) => (l.id === lotId ? { ...l, itemCount: l.itemCount + count } : l))
    );

    addToast("Gerados " + count + " Itens", `Criados com sucesso no lote ${targetLot.lotNumber}.`);
    addLog("Cadastro em Massa", `${count} itens (${baseData.name}) criados no lote ${targetLot.lotNumber}.`, "creation");
  };

  const addMultipleItems = (params: {
    auctionId: string;
    lotId: string;
    baseName: string;
    category: string;
    condition?: ItemCondition;
    quantity: number;
    unitApportionedCost: number;
    unitEstimatedValue: number;
    photoUrl?: string;
  }) => {
    const {
      auctionId,
      lotId,
      baseName,
      category,
      condition = "usado",
      quantity,
      unitApportionedCost,
      unitEstimatedValue,
      photoUrl,
    } = params;

    const count = Math.max(1, Number(quantity) || 1);
    const targetLot = lots.find((l) => l.id === lotId) || lots[0];
    const newCreatedItems: AuctionItem[] = [];
    const startSeq = items.length + 1;
    const dateAdded = new Date().toISOString().split("T")[0];

    const defaultPhoto = photoUrl || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80";

    for (let i = 0; i < count; i++) {
      const seq = startSeq + i;
      const code = `LEIL-2026-${seq.toString().padStart(3, "0")}`;
      const id = "itm-" + seq + "-" + Date.now().toString(36) + "-" + i;

      const item: AuctionItem = {
        id,
        code,
        lotId: targetLot ? targetLot.id : lotId,
        auctionId: targetLot ? targetLot.auctionId : auctionId,
        category,
        name: count > 1 ? `${baseName} #${i + 1}` : baseName,
        description: `${baseName} gerado via cadastro em massa.`,
        quantity: 1,
        condition,
        operationalState: "funcionando",
        location: {
          customText: "Depósito Central",
        },
        photos: [defaultPhoto],
        primaryPhoto: defaultPhoto,
        status: "armazenado",
        originalCost: Number(unitApportionedCost) || 0,
        assignedPercent: Number((100 / count).toFixed(2)),
        apportionedCost: Number(unitApportionedCost) || 0,
        additionalCosts: 0,
        realTotalCost: Number(unitApportionedCost) || 0,
        estimatedMarketMin: (Number(unitEstimatedValue) || 0) * 0.85,
        estimatedMarketAvg: Number(unitEstimatedValue) || 0,
        estimatedMarketMax: (Number(unitEstimatedValue) || 0) * 1.15,
        isAdvertised: false,
        isSold: false,
        dateAdded,
        daysInStock: 0,
        archived: false,
      };

      newCreatedItems.push(item);
    }

    setItems((prev) => [...newCreatedItems, ...prev]);

    if (targetLot) {
      setLots((prev) =>
        prev.map((l) => (l.id === targetLot.id ? { ...l, itemCount: l.itemCount + count } : l))
      );
    }

    addToast(`Gerados ${count} Itens`, `Criados com sucesso no inventário.`);
    addLog("Cadastro em Massa", `${count} itens (${baseName}) criados.`, "creation");
  };

  // Add Expense
  const addExpense = (expenseData: Omit<AdditionalExpense, "id">) => {
    const id = "exp-" + Date.now();
    const newExp: AdditionalExpense = { ...expenseData, id };

    setExpenses((prev) => [newExp, ...prev]);

    // Update item additional costs
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === newExp.itemId) {
          const additionalCosts = (it.additionalCosts || 0) + newExp.amount;
          const realTotalCost = (it.apportionedCost || 0) + additionalCosts;
          return { ...it, additionalCosts, realTotalCost };
        }
        return it;
      })
    );

    addToast("Despesa Adicionada", `R$ ${newExp.amount.toFixed(2)} - ${newExp.description}`);
    addLog("Nova Despesa", `Despesa de R$ ${newExp.amount.toFixed(2)} adicionada: ${newExp.description}.`, "expense", newExp.itemId);
  };

  // Add Maintenance
  const addMaintenance = (maintData: Omit<MaintenanceRecord, "id">) => {
    const id = "maint-" + Date.now();
    const newMaint: MaintenanceRecord = { ...maintData, id };

    setMaintenanceRecords((prev) => [newMaint, ...prev]);

    // If there is a cost, also update additional expenses
    if (newMaint.cost > 0) {
      addExpense({
        itemId: newMaint.itemId,
        category: "Manutenção",
        description: `Serviço: ${newMaint.serviceType}`,
        amount: newMaint.cost,
        date: newMaint.date,
        supplier: newMaint.supplier,
      });
    }

    // Set item status to em_manutencao
    setItems((prev) =>
      prev.map((it) => (it.id === newMaint.itemId ? { ...it, status: "em_manutencao" } : it))
    );

    addToast("Manutenção Registrada", `${newMaint.serviceType} para o item.`);
    addLog("Manutenção Registrada", `${newMaint.serviceType} (${newMaint.description}).`, "maintenance", newMaint.itemId);
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceRecord["status"]) => {
    setMaintenanceRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    addToast("Manutenção Atualizada", "Status do serviço alterado.");
  };

  // Ads
  const addAdvertisement = (adData: Omit<Advertisement, "id">) => {
    const id = "ad-" + Date.now();
    const newAd: Advertisement = { ...adData, id };

    setAdvertisements((prev) => [newAd, ...prev]);

    // Update item advertised state
    setItems((prev) =>
      prev.map((it) =>
        it.id === newAd.itemId
          ? { ...it, isAdvertised: true, status: "anunciado", listedPrice: newAd.listedPrice }
          : it
      )
    );

    addToast("Anúncio Cadastrado", `Publicado no ${newAd.platform} por R$ ${newAd.listedPrice.toFixed(2)}.`);
    addLog("Anúncio Criado", `Item anunciado no ${newAd.platform} por R$ ${newAd.listedPrice.toFixed(2)}.`, "ad", newAd.itemId);
  };

  const updateAdStatus = (id: string, status: Advertisement["status"]) => {
    setAdvertisements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    addToast("Anúncio Atualizado", `Status alterado para ${status}.`);
  };

  const deleteAdvertisement = (id: string) => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== id));
    addToast("Anúncio Removido", "O anúncio foi excluído.");
  };

  // Record Sale (Registrar Venda e calcular ROI)
  const recordSale = (
    saleData: Omit<SaleRecord, "id" | "netSaleValue" | "netProfit" | "roiPercentage" | "marginPercentage">
  ) => {
    const id = "sale-" + Date.now();
    const targetItem = items.find((i) => i.id === saleData.itemId);
    if (!targetItem) return;

    const realCost = targetItem.realTotalCost || 0;

    // Formulas:
    // Net Sale Value = finalPrice - sellerFreight - platformCommission - taxes - otherExpenses
    const netSaleValue =
      (saleData.finalPrice || 0) -
      (saleData.sellerFreight || 0) -
      (saleData.platformCommission || 0) -
      (saleData.taxes || 0) -
      (saleData.otherExpenses || 0);

    // Net Profit = netSaleValue - realTotalCost
    const netProfit = netSaleValue - realCost;

    // ROI = (netProfit / realTotalCost) * 100
    const roiPercentage = realCost > 0 ? (netProfit / realCost) * 100 : 0;

    // Margin = (netProfit / netSaleValue) * 100
    const marginPercentage = netSaleValue > 0 ? (netProfit / netSaleValue) * 100 : 0;

    const newSale: SaleRecord = {
      ...saleData,
      id,
      netSaleValue: Number(netSaleValue.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      roiPercentage: Number(roiPercentage.toFixed(2)),
      marginPercentage: Number(marginPercentage.toFixed(2)),
    };

    setSales((prev) => [newSale, ...prev]);

    // Update item status to 'vendido'
    setItems((prev) =>
      prev.map((it) =>
        it.id === saleData.itemId
          ? {
              ...it,
              status: "vendido",
              isSold: true,
            }
          : it
      )
    );

    addToast(
      "Venda Registrada!",
      `Item vendido por R$ ${saleData.finalPrice.toFixed(2)}. Lucro Líquido: R$ ${netProfit.toFixed(2)} (ROI: ${roiPercentage.toFixed(1)}%).`
    );

    addLog(
      "Venda Realizada",
      `Vendido por R$ ${saleData.finalPrice.toFixed(2)} para ${saleData.buyerName}. Lucro Líquido: R$ ${netProfit.toFixed(2)} (ROI ${roiPercentage.toFixed(1)}%).`,
      "sale",
      saleData.itemId
    );
  };

  // Contacts
  const addContact = (contactData: Omit<Contact, "id">) => {
    const id = "cnt-" + Date.now();
    const newCnt: Contact = { ...contactData, id };
    setContacts((prev) => [newCnt, ...prev]);
    addToast("Contato Cadastrado", `${newCnt.name} salvo.`);
  };

  const updateContact = (id: string, contactData: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...contactData } : c)));
    addToast("Contato Atualizado", "As informações do contato foram alteradas.");
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    addToast("Contato Excluído", "O contato foi removido.");
  };

  // Documents
  const addDocument = (docData: Omit<AppDocument, "id" | "uploadDate">) => {
    const id = "doc-" + Date.now();
    const uploadDate = new Date().toISOString().split("T")[0];
    const newDoc: AppDocument = { ...docData, id, uploadDate };
    setDocuments((prev) => [newDoc, ...prev]);
    addToast("Documento Anexado", `${newDoc.title}`);
  };

  const updateDocument = (id: string, docData: Partial<AppDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...docData } : d)));
    addToast("Documento Atualizado", "Documento atualizado com sucesso.");
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    addToast("Documento Removido", "O documento foi excluído.");
  };

  // Global Financial Metrics Calculation
  const totalInvested = items.reduce((acc, curr) => acc + (curr.realTotalCost || 0), 0);
  const totalEstimatedMarket = items.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 0), 0);
  const totalSoldAmount = sales.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
  const realizedProfit = sales.reduce((acc, curr) => acc + (curr.netProfit || 0), 0);

  // Unsold items in inventory
  const unsoldItems = items.filter((i) => !i.isSold && i.status !== "descartado");
  const capitalInInventoryCost = unsoldItems.reduce((acc, curr) => acc + (curr.realTotalCost || 0), 0);
  const capitalInInventoryEstimated = unsoldItems.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 0), 0);
  const potentialStockProfit = Math.max(0, capitalInInventoryEstimated - capitalInInventoryCost);

  const potentialProfit = items
    .filter((i) => !i.isSold)
    .reduce((acc, curr) => acc + Math.max(0, (curr.estimatedMarketAvg || 0) - (curr.realTotalCost || 0)), 0);

  const metrics = {
    totalInvested,
    totalEstimatedMarket,
    totalSoldAmount,
    realizedProfit,
    potentialProfit,
    totalItemsCount: items.length,
    availableItemsCount: items.filter((i) => i.status === "disponivel").length,
    soldItemsCount: items.filter((i) => i.isSold).length,
    awaitingPickupCount: items.filter((i) => i.status === "aguardando_retirada").length,
    inMaintenanceCount: items.filter((i) => i.status === "em_manutencao").length,
    advertisedCount: items.filter((i) => i.status === "anunciado").length,
    unassessedCount: items.filter((i) => !i.estimatedMarketAvg || i.estimatedMarketAvg === 0).length,
    capitalInInventoryCost,
    capitalInInventoryEstimated,
    potentialStockProfit,
  };

  return (
    <AuctionContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        selectedItemId,
        setSelectedItemId,
        openItemDetail,
        isWizardOpen,
        setIsWizardOpen,
        isBulkModalOpen,
        setIsBulkModalOpen,
        isApportionmentModalOpen,
        setIsApportionmentModalOpen,
        selectedLotForApportionment,
        openApportionmentModal,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalItem,
        openAiModal,
        closeAiModal,
        auctions,
        lots,
        items,
        expenses,
        maintenanceRecords,
        advertisements,
        sales,
        contacts,
        documents,
        activityLogs,
        alerts,
        toasts,
        addAuction,
        updateAuction,
        deleteAuction,
        addLot,
        updateLot,
        deleteLot,
        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        apportionLotCost,
        bulkCreateItems,
        addMultipleItems,
        addExpense,
        addMaintenance,
        updateMaintenanceStatus,
        addAdvertisement,
        updateAdStatus,
        deleteAdvertisement,
        recordSale,
        addContact,
        updateContact,
        deleteContact,
        addDocument,
        updateDocument,
        deleteDocument,
        addToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        metrics,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction deve ser usado dentro de um AuctionProvider");
  }
  return context;
};
