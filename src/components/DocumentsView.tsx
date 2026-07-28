import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { AppDocument, DocType } from "../types";
import { FileText, ExternalLink, Plus, Search, Trash2, X, File } from "lucide-react";

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument, auctions, lots, items } = useAuction();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocType>("edital");
  const [entityType, setEntityType] = useState<"auction" | "lot" | "item" | "sale">("auction");
  const [entityId, setEntityId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");

  const filteredDocs = (documents || []).filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.fileName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "todos" || d.docType === typeFilter || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = () => {
    setTitle("");
    setDocType("edital");
    setEntityType("auction");
    setEntityId(auctions[0]?.id || "");
    setFileName("");
    setFileUrl("");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addDocument({
      title,
      docType,
      entityType,
      entityId: entityId || "geral",
      fileName: fileName || title,
      fileUrl: fileUrl || "#",
      notes,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, docTitle: string) => {
    if (window.confirm(`Deseja excluir o documento "${docTitle}"?`)) {
      deleteDocument(id);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Central de Documentos & Laudos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Editais, Notas Fiscais (NFe), Termos de Arrematação, Guias de Pagamento e Laudos Técnicos
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Anexar Documento</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar documento por título, arquivo, observação..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="edital">Edital</option>
          <option value="nota_arrematacao">Nota de Arrematação</option>
          <option value="nota_fiscal">Nota Fiscal (NFe)</option>
          <option value="comprovante">Comprovante</option>
          <option value="recibo">Recibo</option>
          <option value="contrato">Contrato</option>
          <option value="termo_retirada">Termo de Retirada</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <File className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nenhum documento encontrado.</p>
          <p className="text-xs text-slate-400">Clique em "Anexar Documento" para registrar editais, notas e comprovantes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {(doc.docType || doc.type || "outros").replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{doc.uploadDate || doc.dateUploaded}</span>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Excluir Documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.title}</h3>
                {doc.fileName && <p className="text-slate-400 text-[11px] truncate">Arquivo: {doc.fileName}</p>}
                {doc.notes && <p className="text-slate-500 dark:text-slate-400 text-[11px]">{doc.notes}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                {doc.fileUrl && doc.fileUrl !== "#" ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Visualizar Documento</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">Sem anexo digital</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Documento */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Anexar Documento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: NFe Arrematação Lote 04"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo de Documento</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="edital">Edital de Leilão</option>
                  <option value="nota_arrematacao">Nota de Arrematação</option>
                  <option value="nota_fiscal">Nota Fiscal (NFe)</option>
                  <option value="comprovante">Comprovante de Pagamento</option>
                  <option value="recibo">Recibo</option>
                  <option value="contrato">Contrato / Termo</option>
                  <option value="termo_retirada">Termo de Retirada</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nome do Arquivo</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="nota_fiscal_lote_04.pdf"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL / Link do Arquivo</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
