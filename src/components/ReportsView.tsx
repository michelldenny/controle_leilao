import React from "react";
import { useAuction } from "../context/AuctionContext";
import { BarChart3, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export const ReportsView: React.FC = () => {
  const { items, metrics, auctions, lots } = useAuction();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const exportFullInventoryExcel = () => {
    const data = items.map((i) => ({
      Código: i.code,
      Item: i.name,
      Categoria: i.category,
      Condição: i.condition,
      "Custo Total Real": i.realTotalCost,
      "Valor Estimado Mercado": i.estimatedMarketAvg,
      "Preço Anunciado": i.listedPrice || 0,
      Status: i.status,
      Localização: i.location.customText,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario_Geral");
    XLSX.writeFile(workbook, `Relatorio_Geral_Leiloes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportFinancialReportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório Financeiro & Consolidado de Leilões", 14, 18);
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 14, 25);

    doc.text(`Total Investido em Leilões: R$ ${metrics.totalInvested.toFixed(2)}`, 14, 35);
    doc.text(`Valuation Estimado em Estoque: R$ ${metrics.totalEstimatedMarket.toFixed(2)}`, 14, 42);
    doc.text(`Receita Total Bruta Realizada: R$ ${metrics.totalSoldAmount.toFixed(2)}`, 14, 49);
    doc.text(`Lucro Líquido Acumulado: R$ ${metrics.realizedProfit.toFixed(2)}`, 14, 56);

    doc.save(`Relatorio_Financeiro_Leiloes_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <span>Módulo de Relatórios Consolidados</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Geração de relatórios gerenciais, planilhas auditadas para contabilidade e exportações em PDF
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Inventário Completo (Excel)</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Lista auditada de todos os {items.length} itens cadastrados com custo real, valuation e localização.
            </p>
          </div>
          <button
            onClick={exportFullInventoryExcel}
            className="w-full py-2.5 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
          >
            Baixar Planilha Excel (.xlsx)
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 w-fit">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Relatório Financeiro PDF</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Consolidado de investimentos, receita de vendas, custos adicionais e lucro líquido apurado.
            </p>
          </div>
          <button
            onClick={exportFinancialReportPdf}
            className="w-full py-2.5 font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
          >
            Gerar PDF Executivo
          </button>
        </div>
      </div>
    </div>
  );
};
