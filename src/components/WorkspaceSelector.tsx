import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  ChevronDown,
} from "lucide-react";

interface WorkspaceSelectorProps {
  variant?: "header" | "sidebar" | "compact";
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  variant = "header",
}) => {
  const {
    workspaces,
    currentWorkspaceId,
    currentWorkspace,
    setCurrentWorkspaceId,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useAuction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "rename">("create");
  const [workspaceNameInput, setWorkspaceNameInput] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleOpenCreate = () => {
    setModalMode("create");
    setWorkspaceNameInput("");
    setIsModalOpen(true);
  };

  const handleOpenRename = () => {
    setModalMode("rename");
    setWorkspaceNameInput(currentWorkspace?.name || "");
    setIsModalOpen(true);
  };

  const handleSelectChange = (val: string) => {
    if (val === "__new__") {
      handleOpenCreate();
    } else {
      setCurrentWorkspaceId(val);
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceNameInput.trim()) return;

    if (modalMode === "create") {
      await addWorkspace(workspaceNameInput.trim());
    } else {
      await updateWorkspace(currentWorkspaceId, workspaceNameInput.trim());
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteWorkspace(currentWorkspaceId);
    setIsDeleteConfirmOpen(false);
  };

  if (variant === "sidebar") {
    return (
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
            <span>Espaço / Sócio</span>
          </span>
          <button
            onClick={handleOpenCreate}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-black text-xs"
            title="Criar novo espaço zerado"
          >
            + Novo
          </button>
        </div>

        <div className="relative">
          <select
            value={currentWorkspaceId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full appearance-none px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 pr-8 truncate"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-white dark:bg-slate-900">
                {ws.name}
              </option>
            ))}
            <option value="__new__" className="font-bold text-amber-600">
              + Adicionar Novo Leilão / Sócio
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Modal Create / Rename */}
        {isModalOpen && (
          <ModalForm
            title={modalMode === "create" ? "Novo Leilão / Sócio" : "Renomear Espaço"}
            name={workspaceNameInput}
            setName={setWorkspaceNameInput}
            onSubmit={handleSubmitModal}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // Header / Standard Variant
  return (
    <div className="flex items-center gap-1.5">
      {/* Selector Dropdown */}
      <div className="relative min-w-[190px] max-w-[280px]">
        <select
          value={currentWorkspaceId}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full appearance-none pl-8 pr-7 py-1.5 text-xs font-bold rounded-xl border border-amber-500/30 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-slate-900 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all truncate"
          title="Selecione o leilão ou sociedade atual para filtrar todos os dados"
        >
          {workspaces.map((ws) => (
            <option
              key={ws.id}
              value={ws.id}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1"
            >
              {ws.name}
            </option>
          ))}
          <option value="__new__" className="font-bold text-amber-600 bg-white dark:bg-slate-900">
            + Adicionar Novo Leilão / Sócio
          </option>
        </select>
        <FolderKanban className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Action Buttons: Add, Rename, Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleOpenCreate}
          title="Criar novo espaço zerado (ex: Leilão Sócio 1)"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleOpenRename}
          title="Renomear este espaço / sócio"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {workspaces.length > 1 && (
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            title="Excluir este espaço e seus dados"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal Create / Rename */}
      {isModalOpen && (
        <ModalForm
          title={modalMode === "create" ? "Novo Espaço / Leilão Sócio" : "Renomear Espaço"}
          name={workspaceNameInput}
          setName={setWorkspaceNameInput}
          onSubmit={handleSubmitModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Excluir Espaço?
            </h3>
            <p className="text-xs text-slate-500">
              Tem certeza que deseja excluir <strong>"{currentWorkspace?.name}"</strong>? Todas as
              informações exclusivas deste espaço serão removidas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Modal Form Component
const ModalForm: React.FC<{
  title: string;
  name: string;
  setName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ title, name, setName, onSubmit, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Ao trocar de espaço, todas as abas aparecem zeradas para o novo leilão.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome do Espaço / Leilão Sócio *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Leilão Sócio 1, Leilão Sócio 2, Leilão Detran..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Espaço</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
