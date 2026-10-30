import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

interface WorkspaceSelectorProps {
  variant?: "header" | "compact";
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!workspaceNameInput.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await addWorkspace(workspaceNameInput.trim());
      } else {
        await updateWorkspace(currentWorkspaceId, workspaceNameInput.trim());
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await deleteWorkspace(currentWorkspaceId);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Container Selector */}
      <div className="flex items-center bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl px-2.5 py-1 gap-2 shadow-sm">
        <FolderKanban className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider hidden sm:inline">
          Espaço:
        </span>

        {/* Dropdown Select */}
        <div className="relative">
          <select
            value={currentWorkspaceId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="appearance-none bg-transparent pr-6 py-0.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none max-w-[150px] md:max-w-[210px] truncate"
            title="Trocar de leilão / sociedade (cada um tem seus próprios dados isolados)"
          >
            {workspaces.map((ws) => (
              <option
                key={ws.id}
                value={ws.id}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium py-1"
              >
                {ws.name}
              </option>
            ))}
            <option
              value="__new__"
              className="font-bold text-amber-600 bg-white dark:bg-slate-900 py-1"
            >
              + Adicionar Novo Leilão / Sócio
            </option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons: Criar (+ Novo), Renomear e Excluir */}
      <div className="flex items-center gap-1">
        {/* Botão + Novo */}
        <button
          onClick={handleOpenCreate}
          title="Criar nova página de leilão/sócio (dados começam zerados)"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">+ Novo</span>
        </button>

        {/* Botão Renomear */}
        <button
          onClick={handleOpenRename}
          title="Renomear este espaço / sócio"
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Botão Excluir */}
        <button
          onClick={() => {
            if (workspaces.length > 1) {
              setIsDeleteConfirmOpen(true);
            }
          }}
          disabled={workspaces.length <= 1}
          title={
            workspaces.length <= 1
              ? "Não é possível excluir o único leilão restante"
              : `Excluir "${currentWorkspace?.name}" e seus dados`
          }
          className={`p-1.5 rounded-xl border transition-colors ${
            workspaces.length <= 1
              ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100/50 dark:bg-slate-800/30"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal Create / Rename */}
      {isModalOpen && (
        <ModalForm
          title={modalMode === "create" ? "Criar Novo Leilão / Sócio" : "Renomear Espaço"}
          name={workspaceNameInput}
          setName={setWorkspaceNameInput}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitModal}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => !isSubmitting && setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Excluir Espaço?
                </h3>
                <span className="text-xs text-rose-500 font-semibold">Ação irreversível</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem certeza que deseja excluir o leilão{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                "{currentWorkspace?.name}"
              </strong>
              ? Todos os itens, lotes e despesas cadastrados nele serão removidos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Excluindo..." : "Excluir Espaço"}
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
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ title, name, setName, isSubmitting, onSubmit, onClose }) => {
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
                Cada leilão/sociedade tem seu próprio painel de itens isolado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
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
              placeholder="Ex: Leilão Sócio 1, Leilão Sócio 2, Leilão Pessoal..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Salvando..." : "Salvar Espaço"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
