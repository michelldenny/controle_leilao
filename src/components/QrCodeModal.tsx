import React from "react";
import { AuctionItem } from "../types";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Printer, X } from "lucide-react";

interface QrCodeModalProps {
  item: AuctionItem;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ item, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Etiqueta Físico & QR Code do Ativo
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="p-5 rounded-2xl bg-white text-slate-950 border-2 border-slate-900 space-y-3 print:border-none">
          <div className="flex items-center justify-between border-b pb-2 border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Patrimônio Leilão</span>
              <h4 className="font-mono font-extrabold text-sm">{item.code}</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shrink-0">
              <QRCodeSVG value={`https://patrimonioleiloes.internal/item/${item.id}`} size={90} />
            </div>

            <div className="space-y-1 text-xs">
              <h5 className="font-bold line-clamp-2 leading-snug">{item.name}</h5>
              <p className="text-[11px] text-slate-600"><strong>Loc:</strong> {item.location.customText}</p>
              <p className="text-[11px] text-slate-600"><strong>Custo:</strong> {formatCurrency(item.realTotalCost)}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
