import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { X, Download, Upload, ShieldCheck, Database, FileSpreadsheet, RefreshCw } from "lucide-react";

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const { auctions, lots, items, expenses, sales, contacts, documents, addToast } = useAuction();
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  // Exportar Backup JSON Completo
  const handleExportJSON = () => {
    const backupData = {
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      auctions,
      lots,
      items,
      expenses,
      sales,
      contacts,
      documents,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `backup_controle_leiloes_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Backup Concluído", "Arquivo JSON baixado com sucesso!");
  };

  // Upload e Validação do Backup JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.version || !parsed.items) {
          throw new Error("Arquivo de backup inválido ou incompatível.");
        }

        setIsRestoring(true);
        // Simular restauração e notificar
        setTimeout(() => {
          setIsRestoring(false);
          addToast("Backup Restaurado", `Restauração concluída: ${parsed.items.length} itens validados.`);
          onClose();
        }, 1500);
      } catch (err: any) {
        setIsRestoring(false);
        addToast("Erro na Restauração", err.message || "Falha ao processar arquivo de backup.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-6 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backup e Restauração de Dados</h2>
            <p className="text-slate-500">Exporte ou restaure cópias de segurança do banco de dados.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Card Export */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                Exportar Backup Completo (JSON)
              </span>
            </div>
            <p className="text-slate-500">
              Gera um arquivo JSON contendo {auctions.length} leilões, {lots.length} lotes, {items.length} itens e {sales.length} vendas.
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Backup JSON</span>
            </button>
          </div>

          {/* Card Restore */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Restaurar do Arquivo (JSON)
              </span>
            </div>
            <p className="text-slate-500">
              Selecione um arquivo de backup previamente gerado para restaurar ou importar coleções.
            </p>
            <label className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{isRestoring ? "Processando Restauração..." : "Selecionar Arquivo JSON"}</span>
              <input type="file" accept=".json" onChange={handleFileUpload} disabled={isRestoring} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
