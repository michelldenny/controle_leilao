import React, { useState } from "react";
import { AuctionProvider, useAuction } from "./context/AuctionContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ToastContainer } from "./components/ToastContainer";

import { DashboardView } from "./components/DashboardView";
import { AuctionsView } from "./components/AuctionsView";
import { LotsView } from "./components/LotsView";
import { InventoryView } from "./components/InventoryView";
import { ItemDetailView } from "./components/ItemDetailView";
import { AdvertisementsView } from "./components/AdvertisementsView";
import { SalesView } from "./components/SalesView";
import { FinancialView } from "./components/FinancialView";
import { BusinessIntelligenceView } from "./components/BusinessIntelligenceView";
import { OpportunitiesView } from "./components/OpportunitiesView";
import { ContactsView } from "./components/ContactsView";
import { DocumentsView } from "./components/DocumentsView";
import { ReportsView } from "./components/ReportsView";

import { ItemWizardModal } from "./components/ItemWizardModal";
import { BulkItemModal } from "./components/BulkItemModal";
import { ApportionmentModal } from "./components/ApportionmentModal";
import { QrCodeModal } from "./components/QrCodeModal";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { ImportCsvModal } from "./components/ImportCsvModal";
import { AuctionItem } from "./types";

const MainAppLayout: React.FC = () => {
  const {
    activeTab,
    selectedItemId,
    setSelectedItemId,
    apportionmentModalLot,
    closeApportionmentModal,
    darkMode,
  } = useAuction();

  const [collapsed, setCollapsed] = useState(false);
  const [qrCodeItem, setQrCodeItem] = useState<AuctionItem | null>(null);

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* View Content Router */}
        <main className="flex-1 pb-16">
          {selectedItemId ? (
            <ItemDetailView
              itemId={selectedItemId}
              onBack={() => setSelectedItemId(null)}
              onSelectQrCode={(item) => setQrCodeItem(item)}
            />
          ) : (
            <>
              {activeTab === "dashboard" && <DashboardView />}
              {activeTab === "auctions" && <AuctionsView />}
              {activeTab === "lots" && <LotsView />}
              {activeTab === "inventory" && (
                <InventoryView onSelectQrCode={(item) => setQrCodeItem(item)} />
              )}
              {activeTab === "advertisements" && <AdvertisementsView />}
              {activeTab === "sales" && <SalesView />}
              {activeTab === "financial" && <FinancialView />}
              {activeTab === "bi" && <BusinessIntelligenceView />}
              {activeTab === "opportunities" && <OpportunitiesView />}
              {activeTab === "contacts" && <ContactsView />}
              {activeTab === "documents" && <DocumentsView />}
              {activeTab === "reports" && <ReportsView />}
            </>
          )}
        </main>
      </div>

      {/* Modals & Overlay Drawers */}
      <ItemWizardModal />
      <BulkItemModal />
      <AiAssistantModal />
      <ImportCsvModal />

      {apportionmentModalLot && (
        <ApportionmentModal
          lot={apportionmentModalLot}
          onClose={closeApportionmentModal}
        />
      )}

      {qrCodeItem && (
        <QrCodeModal item={qrCodeItem} onClose={() => setQrCodeItem(null)} />
      )}

      {/* Toasts Notification Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuctionProvider>
      <MainAppLayout />
    </AuctionProvider>
  );
}

export default App;
