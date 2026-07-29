import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  Auction,
  Lot,
  AuctionItem,
  AdditionalExpense,
  MaintenanceRecord,
  Advertisement,
  SaleRecord,
  Contact,
  AppDocument,
  ActivityLog,
  AlertItem,
  UserRole,
  ApportionmentMethod,
  ItemCondition,
  OperationalState,
} from "../types";
import { initialAlerts } from "../mockData";

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
  apportionmentModalLot: Lot | null;
  openApportionmentModal: (lot: Lot) => void;
  closeApportionmentModal: () => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalItem: AuctionItem | null;
  openAiModal: (item?: AuctionItem) => void;
  closeAiModal: () => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;

  // Database Connection & Reset
  isFirebaseConnected: boolean;
  clearAllDatabaseData: () => Promise<void>;

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
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Firestore connection status
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Entities Data - Initialize with empty arrays (0 fictitious values)
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [expenses, setExpenses] = useState<AdditionalExpense[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [alerts] = useState<AlertItem[]>(initialAlerts);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Sync with Firestore in real-time
  useEffect(() => {
    // Clear old localStorage mock caches
    [
      "leilao_auctions",
      "leilao_lots",
      "leilao_items",
      "leilao_expenses",
      "leilao_maintenance",
      "leilao_advertisements",
      "leilao_sales",
      "leilao_contacts",
      "leilao_documents",
      "leilao_activity_logs",
    ].forEach((k) => localStorage.removeItem(k));

    const unsubAuctions = onSnapshot(collection(db, "auctions"), (snap) => {
      setAuctions(snap.docs.map((d) => d.data() as Auction));
    }, () => setIsFirebaseConnected(false));

    const unsubLots = onSnapshot(collection(db, "lots"), (snap) => {
      setLots(snap.docs.map((d) => d.data() as Lot));
    });

    const unsubItems = onSnapshot(collection(db, "items"), (snap) => {
      setItems(snap.docs.map((d) => d.data() as AuctionItem));
    });

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map((d) => d.data() as AdditionalExpense));
    });

    const unsubMaint = onSnapshot(collection(db, "maintenanceRecords"), (snap) => {
      setMaintenanceRecords(snap.docs.map((d) => d.data() as MaintenanceRecord));
    });

    const unsubAds = onSnapshot(collection(db, "advertisements"), (snap) => {
      setAdvertisements(snap.docs.map((d) => d.data() as Advertisement));
    });

    const unsubSales = onSnapshot(collection(db, "sales"), (snap) => {
      setSales(snap.docs.map((d) => d.data() as SaleRecord));
    });

    const unsubContacts = onSnapshot(collection(db, "contacts"), (snap) => {
      setContacts(snap.docs.map((d) => d.data() as Contact));
    });

    const unsubDocs = onSnapshot(collection(db, "documents"), (snap) => {
      setDocuments(snap.docs.map((d) => d.data() as AppDocument));
    });

    const unsubLogs = onSnapshot(collection(db, "activityLogs"), (snap) => {
      const list = snap.docs.map((d) => d.data() as ActivityLog);
      setActivityLogs(list.sort((a, b) => (b.id || "").localeCompare(a.id || "")));
    });

    return () => {
      unsubAuctions();
      unsubLots();
      unsubItems();
      unsubExpenses();
      unsubMaint();
      unsubAds();
      unsubSales();
      unsubContacts();
      unsubDocs();
      unsubLogs();
    };
  }, []);

  // Theme toggle
  useEffect(() => {
    localStorage.setItem("leilao_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
    const id = "log-" + Date.now();
    const newLog: ActivityLog = {
      id,
      itemId,
      title,
      description,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      user: userRole === "admin" ? "Administrador" : userRole,
      type,
    };
    setDoc(doc(db, "activityLogs", id), newLog).catch(console.error);
  };

  // Clear all database data (zerar dados)
  const clearAllDatabaseData = async () => {
    try {
      const colNames = [
        "auctions",
        "lots",
        "items",
        "expenses",
        "maintenanceRecords",
        "advertisements",
        "sales",
        "contacts",
        "documents",
        "activityLogs",
      ];
      for (const name of colNames) {
        const snap = await getDocs(collection(db, name));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
      setAuctions([]);
      setLots([]);
      setItems([]);
      setExpenses([]);
      setMaintenanceRecords([]);
      setAdvertisements([]);
      setSales([]);
      setContacts([]);
      setDocuments([]);
      setActivityLogs([]);
      addToast("Banco de Dados Zerado", "Todos os dados fictícios foram removidos do Firebase.", "info");
    } catch (err) {
      console.error("Erro ao zerar dados no Firebase:", err);
      addToast("Erro", "Não foi possível apagar os dados do Firebase.", "error");
    }
  };

  const openItemDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    setActiveTab("item-detail");
  };

  const openApportionmentModal = (lot: Lot) => {
    setSelectedLotForApportionment(lot);
    setIsApportionmentModalOpen(true);
  };

  const closeApportionmentModal = () => {
    setIsApportionmentModalOpen(false);
    setSelectedLotForApportionment(null);
  };

  const openAiModal = (item?: AuctionItem) => {
    setAiModalItem(item || null);
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setAiModalItem(null);
  };

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
    const id = "auc-" + Date.now().toString(36);
    const newAuction: Auction = { ...auctionData, id };
    setDoc(doc(db, "auctions", id), newAuction).catch(console.error);
    addToast("Leilão Cadastrado", `Leilão "${newAuction.name}" adicionado com sucesso!`);
    addLog("Novo Leilão", `Leilão ${newAuction.name} cadastrado.`, "creation");
    return newAuction;
  };

  const updateAuction = (id: string, auctionData: Partial<Auction>) => {
    const existing = auctions.find((a) => a.id === id);
    if (!existing) return;
    const updated = { ...existing, ...auctionData };
    setDoc(doc(db, "auctions", id), updated).catch(console.error);
    addToast("Leilão Atualizado", "As informações do leilão foram atualizadas.");
  };

  const deleteAuction = (id: string) => {
    deleteDoc(doc(db, "auctions", id)).catch(console.error);
    addToast("Leilão Excluído", "O leilão foi removido do sistema.");
  };

  // CRUD Lots
  const addLot = (lotData: Omit<Lot, "id" | "totalLotCost">): Lot => {
    const id = "lot-" + Date.now().toString(36);
    const totalLotCost = calculateTotalLotCost(lotData);
    const newLot: Lot = { ...lotData, id, totalLotCost };
    setDoc(doc(db, "lots", id), newLot).catch(console.error);
    addToast("Lote Cadastrado", `Lote ${newLot.lotNumber} adicionado com custo total de R$ ${totalLotCost.toFixed(2)}.`);
    addLog("Novo Lote", `Lote ${newLot.lotNumber} cadastrado com valor de lance R$ ${newLot.winningBid.toFixed(2)}.`, "creation");
    return newLot;
  };

  const updateLot = (id: string, lotData: Partial<Lot>) => {
    const existing = lots.find((l) => l.id === id);
    if (!existing) return;
    const updated = { ...existing, ...lotData };
    updated.totalLotCost = calculateTotalLotCost(updated);
    setDoc(doc(db, "lots", id), updated).catch(console.error);
    addToast("Lote Atualizado", "Dados do lote atualizados com sucesso.");
  };

  const deleteLot = (id: string) => {
    deleteDoc(doc(db, "lots", id)).catch(console.error);
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

    setDoc(doc(db, "items", id), newItem).catch(console.error);

    const targetLot = lots.find((l) => l.id === newItem.lotId);
    if (targetLot) {
      const newCount = (targetLot.itemCount || 0) + 1;
      updateLot(targetLot.id, { itemCount: newCount });

      // Recalcula o rateio do lote considerando todos os itens existentes mais o novo item
      const currentLotItems = [...items.filter((i) => i.lotId === targetLot.id), newItem];
      const totalLotCost = targetLot.totalLotCost || 0;
      const equalShare = Number((totalLotCost / currentLotItems.length).toFixed(2));
      const equalPercent = Number((100 / currentLotItems.length).toFixed(2));

      currentLotItems.forEach((item) => {
        const realTotalCost = equalShare + (item.additionalCosts || 0);
        const updatedItem = {
          ...item,
          apportionedCost: equalShare,
          assignedPercent: equalPercent,
          realTotalCost: Number(realTotalCost.toFixed(2)),
        };
        setDoc(doc(db, "items", item.id), updatedItem).catch(console.error);
      });
    }

    addToast("Item Cadastrado", `Item ${newItem.code} - ${newItem.name} adicionado ao inventário.`);
    addLog("Novo Item", `Item ${newItem.name} (${newItem.code}) cadastrado no lote.`, "creation", newItem.id);

    return newItem;
  };

  const updateItem = (id: string, itemData: Partial<AuctionItem>) => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;
    const updated = { ...existing, ...itemData };
    updated.realTotalCost = (updated.apportionedCost || 0) + (updated.additionalCosts || 0);

    // Se o status mudar para 'vendido', garantir a marcação e registro de venda se ainda não existir
    if (itemData.status === "vendido") {
      updated.isSold = true;
      const existingSale = sales.find((s) => s.itemId === id);
      if (!existingSale) {
        const salePrice = updated.listedPrice || updated.estimatedMarketAvg || updated.realTotalCost;
        const netProfit = salePrice - updated.realTotalCost;
        const roiPercentage = updated.realTotalCost > 0 ? (netProfit / updated.realTotalCost) * 100 : 0;
        const marginPercentage = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

        const newSale: SaleRecord = {
          id: "sale-" + Date.now(),
          itemId: id,
          saleDate: new Date().toISOString().split("T")[0],
          finalPrice: salePrice,
          platform: "Venda Direta / Inventário",
          buyerName: "Cliente Direct",
          buyerContact: "",
          sellerFreight: 0,
          platformCommission: 0,
          taxes: 0,
          otherExpenses: 0,
          netSaleValue: Number(salePrice.toFixed(2)),
          netProfit: Number(netProfit.toFixed(2)),
          roiPercentage: Number(roiPercentage.toFixed(2)),
          marginPercentage: Number(marginPercentage.toFixed(2)),
          notes: "Registrado automaticamente ao alterar status do item para Vendido no Inventário",
        };
        setDoc(doc(db, "sales", newSale.id), newSale).catch(console.error);
      }
    } else if (itemData.status && itemData.status !== "vendido" && existing.status === "vendido") {
      updated.isSold = false;
      const existingSale = sales.find((s) => s.itemId === id);
      if (existingSale) {
        deleteDoc(doc(db, "sales", existingSale.id)).catch(console.error);
      }
    }

    if (itemData.status && itemData.status !== existing.status) {
      addLog("Status Alterado", `Status do item ${existing.code} alterado para ${itemData.status}.`, "status_change", id);
    }
    if (itemData.location && JSON.stringify(itemData.location) !== JSON.stringify(existing.location)) {
      addLog("Status / Localização Alterada", `Localização do item ${existing.code} atualizada para ${itemData.location.customText}.`, "location_change", id);
    }

    setDoc(doc(db, "items", id), updated).catch(console.error);
    addToast("Item Atualizado", "Alterações salvas com sucesso.");
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    deleteDoc(doc(db, "items", id)).catch(console.error);

    if (itemToDelete) {
      const targetLot = lots.find((l) => l.id === itemToDelete.lotId);
      if (targetLot) {
        const remainingItems = items.filter((i) => i.lotId === targetLot.id && i.id !== id);
        const newCount = Math.max(0, (targetLot.itemCount || 1) - 1);
        updateLot(targetLot.id, { itemCount: newCount });

        if (remainingItems.length > 0) {
          const totalLotCost = targetLot.totalLotCost || 0;
          const equalShare = Number((totalLotCost / remainingItems.length).toFixed(2));
          const equalPercent = Number((100 / remainingItems.length).toFixed(2));

          remainingItems.forEach((item) => {
            const realTotalCost = equalShare + (item.additionalCosts || 0);
            const updatedItem = {
              ...item,
              apportionedCost: equalShare,
              assignedPercent: equalPercent,
              realTotalCost: Number(realTotalCost.toFixed(2)),
            };
            setDoc(doc(db, "items", item.id), updatedItem).catch(console.error);
          });
        }
      }
    }

    addToast("Item Excluído", "O item foi removido do inventário.");
  };

  const archiveItem = (id: string) => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;
    updateItem(id, { archived: !existing.archived });
  };

  // Apportion Lot Cost
  const apportionLotCost = (
    lotId: string,
    method: ApportionmentMethod,
    customValues?: { itemId: string; value: number }[]
  ) => {
    const targetLot = lots.find((l) => l.id === lotId);
    if (!targetLot) return;

    const lotItems = items.filter((i) => i.lotId === lotId);
    if (lotItems.length === 0) return;

    const totalLotCost = targetLot.totalLotCost || 0;

    lotItems.forEach((item) => {
      let apportioned = 0;
      let assignedPercent = 0;

      if (method === "igualitario") {
        assignedPercent = 100 / lotItems.length;
        apportioned = totalLotCost / lotItems.length;
      } else if (method === "manual" && customValues) {
        const found = customValues.find((cv) => cv.itemId === item.id);
        apportioned = found ? found.value : 0;
        assignedPercent = totalLotCost > 0 ? (apportioned / totalLotCost) * 100 : 0;
      } else if (method === "percentual" && customValues) {
        const found = customValues.find((cv) => cv.itemId === item.id);
        assignedPercent = found ? found.value : 0;
        apportioned = (totalLotCost * assignedPercent) / 100;
      } else if (method === "valor_estimado") {
        const sumEstimated = lotItems.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 1), 0);
        const itemEst = item.estimatedMarketAvg || 1;
        assignedPercent = sumEstimated > 0 ? (itemEst / sumEstimated) * 100 : 100 / lotItems.length;
        apportioned = (totalLotCost * assignedPercent) / 100;
      }

      const realTotalCost = apportioned + (item.additionalCosts || 0);

      const updated = {
        ...item,
        apportionedCost: Number(apportioned.toFixed(2)),
        assignedPercent: Number(assignedPercent.toFixed(2)),
        realTotalCost: Number(realTotalCost.toFixed(2)),
      };

      setDoc(doc(db, "items", item.id), updated).catch(console.error);
    });

    addToast("Rateio Concluído", `Custo de R$ ${totalLotCost.toFixed(2)} rateado entre ${lotItems.length} itens (${method}).`);
    addLog("Rateio de Custo", `Rateio (${method}) aplicado no lote ${targetLot.lotNumber}.`, "expense");
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

    const startSeq = items.length + 1;
    const dateAdded = new Date().toISOString().split("T")[0];

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

      setDoc(doc(db, "items", id), item).catch(console.error);
    }

    updateLot(lotId, { itemCount: (targetLot.itemCount || 0) + count });

    addToast(`Gerados ${count} Itens`, `Criados com sucesso no lote ${targetLot.lotNumber}.`);
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

      setDoc(doc(db, "items", id), item).catch(console.error);
    }

    if (targetLot) {
      updateLot(targetLot.id, { itemCount: (targetLot.itemCount || 0) + count });
    }

    addToast(`Gerados ${count} Itens`, `Criados com sucesso no banco de dados.`);
    addLog("Cadastro em Massa", `${count} itens (${baseName}) criados.`, "creation");
  };

  // Add Expense
  const addExpense = (expenseData: Omit<AdditionalExpense, "id">) => {
    const id = "exp-" + Date.now();
    const newExp: AdditionalExpense = { ...expenseData, id };

    setDoc(doc(db, "expenses", id), newExp).catch(console.error);

    const targetItem = items.find((i) => i.id === newExp.itemId);
    if (targetItem) {
      const additionalCosts = (targetItem.additionalCosts || 0) + newExp.amount;
      const realTotalCost = (targetItem.apportionedCost || 0) + additionalCosts;
      updateItem(targetItem.id, { additionalCosts, realTotalCost });
    }

    addToast("Despesa Adicionada", `R$ ${newExp.amount.toFixed(2)} - ${newExp.description}`);
    addLog("Nova Despesa", `Despesa de R$ ${newExp.amount.toFixed(2)} adicionada: ${newExp.description}.`, "expense", newExp.itemId);
  };

  // Add Maintenance
  const addMaintenance = (maintData: Omit<MaintenanceRecord, "id">) => {
    const id = "maint-" + Date.now();
    const newMaint: MaintenanceRecord = { ...maintData, id };

    setDoc(doc(db, "maintenanceRecords", id), newMaint).catch(console.error);

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

    updateItem(newMaint.itemId, { status: "em_manutencao" });

    addToast("Manutenção Registrada", `${newMaint.serviceType} para o item.`);
    addLog("Manutenção Registrada", `${newMaint.serviceType} (${newMaint.description}).`, "maintenance", newMaint.itemId);
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceRecord["status"]) => {
    const existing = maintenanceRecords.find((m) => m.id === id);
    if (!existing) return;
    setDoc(doc(db, "maintenanceRecords", id), { ...existing, status }).catch(console.error);
    addToast("Manutenção Atualizada", "Status do serviço alterado.");
  };

  // Ads
  const addAdvertisement = (adData: Omit<Advertisement, "id">) => {
    const id = "ad-" + Date.now();
    const newAd: Advertisement = { ...adData, id };

    setDoc(doc(db, "advertisements", id), newAd).catch(console.error);

    updateItem(newAd.itemId, {
      isAdvertised: true,
      status: "anunciado",
      listedPrice: newAd.listedPrice,
    });

    addToast("Anúncio Cadastrado", `Publicado no ${newAd.platform} por R$ ${newAd.listedPrice.toFixed(2)}.`);
    addLog("Anúncio Criado", `Item anunciado no ${newAd.platform} por R$ ${newAd.listedPrice.toFixed(2)}.`, "ad", newAd.itemId);
  };

  const updateAdStatus = (id: string, status: Advertisement["status"]) => {
    const existing = advertisements.find((a) => a.id === id);
    if (!existing) return;
    setDoc(doc(db, "advertisements", id), { ...existing, status }).catch(console.error);
    addToast("Anúncio Atualizado", `Status alterado para ${status}.`);
  };

  const deleteAdvertisement = (id: string) => {
    deleteDoc(doc(db, "advertisements", id)).catch(console.error);
    addToast("Anúncio Removido", "O anúncio foi excluído.");
  };

  // Record Sale
  const recordSale = (
    saleData: Omit<SaleRecord, "id" | "netSaleValue" | "netProfit" | "roiPercentage" | "marginPercentage">
  ) => {
    const id = "sale-" + Date.now();
    const targetItem = items.find((i) => i.id === saleData.itemId);
    if (!targetItem) return;

    const realCost = targetItem.realTotalCost || 0;
    const netSaleValue =
      (saleData.finalPrice || 0) -
      (saleData.sellerFreight || 0) -
      (saleData.platformCommission || 0) -
      (saleData.taxes || 0) -
      (saleData.otherExpenses || 0);

    const netProfit = netSaleValue - realCost;
    const roiPercentage = realCost > 0 ? (netProfit / realCost) * 100 : 0;
    const marginPercentage = netSaleValue > 0 ? (netProfit / netSaleValue) * 100 : 0;

    const newSale: SaleRecord = {
      ...saleData,
      id,
      netSaleValue: Number(netSaleValue.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      roiPercentage: Number(roiPercentage.toFixed(2)),
      marginPercentage: Number(marginPercentage.toFixed(2)),
    };

    setDoc(doc(db, "sales", id), newSale).catch(console.error);

    updateItem(saleData.itemId, {
      status: "vendido",
      isSold: true,
    });

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
    setDoc(doc(db, "contacts", id), newCnt).catch(console.error);
    addToast("Contato Cadastrado", `${newCnt.name} salvo.`);
  };

  const updateContact = (id: string, contactData: Partial<Contact>) => {
    const existing = contacts.find((c) => c.id === id);
    if (!existing) return;
    setDoc(doc(db, "contacts", id), { ...existing, ...contactData }).catch(console.error);
    addToast("Contato Atualizado", "As informações do contato foram alteradas.");
  };

  const deleteContact = (id: string) => {
    deleteDoc(doc(db, "contacts", id)).catch(console.error);
    addToast("Contato Excluído", "O contato foi removido.");
  };

  // Documents
  const addDocument = (docData: Omit<AppDocument, "id" | "uploadDate">) => {
    const id = "doc-" + Date.now();
    const uploadDate = new Date().toISOString().split("T")[0];
    const newDoc: AppDocument = { ...docData, id, uploadDate };
    setDoc(doc(db, "documents", id), newDoc).catch(console.error);
    addToast("Documento Anexado", `${newDoc.title}`);
  };

  const updateDocument = (id: string, docData: Partial<AppDocument>) => {
    const existing = documents.find((d) => d.id === id);
    if (!existing) return;
    setDoc(doc(db, "documents", id), { ...existing, ...docData }).catch(console.error);
    addToast("Documento Atualizado", "Documento atualizado com sucesso.");
  };

  const deleteDocument = (id: string) => {
    deleteDoc(doc(db, "documents", id)).catch(console.error);
    addToast("Documento Removido", "O documento foi excluído.");
  };

  // Global Financial Metrics Calculation
  const totalInvested = items.reduce((acc, curr) => acc + (curr.realTotalCost || 0), 0);
  const totalEstimatedMarket = items.reduce((acc, curr) => acc + (curr.estimatedMarketAvg || 0), 0);
  const totalSoldAmount = sales.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
  const realizedProfit = sales.reduce((acc, curr) => acc + (curr.netProfit || 0), 0);

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
        apportionmentModalLot: selectedLotForApportionment,
        openApportionmentModal,
        closeApportionmentModal,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalItem,
        openAiModal,
        closeAiModal,
        isImportModalOpen,
        setIsImportModalOpen,
        isFirebaseConnected,
        clearAllDatabaseData,
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
