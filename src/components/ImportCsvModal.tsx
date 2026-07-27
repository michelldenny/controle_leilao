import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { FileSpreadsheet, X, Upload, Check } from "lucide-react";
import * as XLSX from "xlsx";

export const ImportCsvModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, addMultipleItems, lots, auctions } = useAuction();

  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  if (!isImportModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setParsedRows(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return;

    const firstLot = lots[0];

    addMultipleItems({
      auctionId: firstLot?.auctionId || auctions[0]?.id || "auc_1",
      lotId: firstLot?.id || "lot_1",
      baseName: parsedRows[0]?.Nome || parsedRows[0]?.Item || "Item Importado",
      category: parsedRows[0]?.Categoria || "Eletrônicos & TI",
      condition: "usado",
      quantity: parsedRows.length,
      unitApportionedCost: Number(parsedRows[0]?.Custo) || 500,
      unitEstimatedValue: Number(parsedRows[0]?.ValorEstimado) || 1200,
    });

    setIsImportModalOpen(false);
    setParsedRows([]);
    setFileName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Importação em Massa de Planilha (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Importe lotes inteiros de editais ou relatórios de arrematação
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsImportModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
            <Upload className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Arraste e solte seu arquivo .XLSX ou .CSV aqui
            </p>
            <p className="text-slate-400 text-[11px]">Campos suportados: Nome, Categoria, Custo, ValorEstimado</p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="mt-2 text-xs text-slate-500 cursor-pointer"
            />
          </div>

          {parsedRows.length > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold flex items-center justify-between">
              <span>{parsedRows.length} linhas reconhecidas na planilha!</span>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 font-bold rounded-xl bg-emerald-500 text-white shadow-md"
              >
                Confirmar Importação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
