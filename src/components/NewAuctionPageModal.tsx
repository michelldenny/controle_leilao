import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { AuctionPartner, AuctionStatus } from "../types";
import {
  Layers,
  X,
  Plus,
  Trash2,
  Users,
  Percent,
  Calendar,
  Building,
  DollarSign,
  Sparkles,
  Check,
} from "lucide-react";

interface NewAuctionPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAuctionPageModal: React.FC<NewAuctionPageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addAuction, openAuctionPage } = useAuction();

  const [name, setName] = useState("");
  const [auctioneer, setAuctioneer] = useState("");
  const [platform, setPlatform] = useState("");
  const [auctionType, setAuctionType] = useState("Judicial");
  const [auctionDate, setAuctionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [commissionPercentage, setCommissionPercentage] = useState(5);
  const [societyNotes, setSocietyNotes] = useState("");
  const [colorTag, setColorTag] = useState("amber");

  // Partners List
  const [partners, setPartners] = useState<AuctionPartner[]>([
    {
      id: "part-1",
      name: "Eu (Administrador)",
      sharePercentage: 50,
      phone: "",
      notes: "Gestão operacional e arrematação",
    },
    {
      id: "part-2",
      name: "Sócio Parceiro",
      sharePercentage: 50,
      phone: "",
      notes: "Investidor de capital",
    },
  ]);

  if (!isOpen) return null;

  const totalPercentage = partners.reduce(
    (sum, p) => sum + (Number(p.sharePercentage) || 0),
    0
  );

  const handleAddPartner = () => {
    const newId = "part-" + crypto.randomUUID();
    const currentCount = partners.length + 1;
    setPartners([
      ...partners,
      {
        id: newId,
        name: `Sócio ${currentCount}`,
        sharePercentage: 0,
        phone: "",
        notes: "",
      },
    ]);
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 1) return;
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handlePartnerChange = (
    id: string,
    field: keyof AuctionPartner,
    value: any
  ) => {
    setPartners(
      partners.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleDistributeEqually = () => {
    if (partners.length === 0) return;
    const equalShare = Number((100 / partners.length).toFixed(2));
    setPartners(
      partners.map((p) => ({
        ...p,
        sharePercentage: equalShare,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAuction = addAuction({
      name: name.trim(),
      auctioneer: auctioneer.trim() || "Leiloeiro Oficial",
      platform: platform.trim() || "Presencial / Online",
      auctionType,
      auctionDate,
      city,
      state,
      pickupAddress: "",
      commissionPercentage: Number(commissionPercentage),
      status: "participando" as AuctionStatus,
      partners,
      societyNotes: societyNotes.trim(),
      colorTag,
    });

    onClose();
    if (newAuction && newAuction.id) {
      openAuctionPage(newAuction.id);
    }
  };

  const colorOptions = [
    { id: "amber", name: "Âmbar", bg: "bg-amber-500", ring: "ring-amber-500" },
    { id: "emerald", name: "Esmeralda", bg: "bg-emerald-500", ring: "ring-emerald-500" },
    { id: "blue", name: "Azul", bg: "bg-blue-500", ring: "ring-blue-500" },
    { id: "purple", name: "Roxo", bg: "bg-purple-500", ring: "ring-purple-500" },
    { id: "rose", name: "Rosa", bg: "bg-rose-500", ring: "ring-rose-500" },
    { id: "teal", name: "Turquesa", bg: "bg-teal-500", ring: "ring-teal-500" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nova Página de Leilão & Sociedade
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crie um painel próprio e isolado com seus sócios. Os itens deste leilão não se misturam com outros.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados do Leilão */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Building className="w-4 h-4" />
              1. Identificação do Leilão / Página
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome da Página ou Leilão *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leilão Receita Federal - Sociedade Carlos e João"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leiloeiro / Órgão
                </label>
                <input
                  type="text"
                  value={auctioneer}
                  onChange={(e) => setAuctioneer(e.target.value)}
                  placeholder="Ex: Freitas Leiloeiro"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Plataforma / Site
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Ex: Mega Leilões"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data do Leilão
                </label>
                <input
                  type="date"
                  value={auctionDate}
                  onChange={(e) => setAuctionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cidade / UF
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="UF"
                    className="w-14 px-2 py-2 text-sm text-center font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Comissão do Leiloeiro (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cor da Etiqueta
                </label>
                <div className="flex items-center gap-2 py-1.5">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setColorTag(c.id)}
                      className={`w-6 h-6 rounded-full ${c.bg} transition-all ${
                        colorTag === c.id ? `ring-4 ${c.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110` : "opacity-70 hover:opacity-100"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sócios & Participação */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  2. Sócios & Divisão da Sociedade
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Configure quem participa deste leilão e as cotas de lucro/custo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDistributeEqually}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Divisão Igual ({partners.length > 0 ? (100 / partners.length).toFixed(1) : 0}%)
                </button>
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Sócio</span>
                </button>
              </div>
            </div>

            {/* Total Percentage Indicator */}
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border ${
                Math.abs(totalPercentage - 100) < 0.1
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
              }`}
            >
              <span>Soma das Participações:</span>
              <span className="font-bold text-sm">{totalPercentage.toFixed(1)}%</span>
            </div>

            {/* Partners List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {partners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      required
                      value={partner.name}
                      onChange={(e) =>
                        handlePartnerChange(partner.id, "name", e.target.value)
                      }
                      placeholder="Nome do Sócio"
                      className="flex-1 px-2.5 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />

                    <div className="flex items-center gap-1 w-24 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        required
                        value={partner.sharePercentage}
                        onChange={(e) =>
                          handlePartnerChange(
                            partner.id,
                            "sharePercentage",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm font-bold text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>

                    {partners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(partner.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remover sócio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={partner.phone || ""}
                      onChange={(e) =>
                        handlePartnerChange(partner.id, "phone", e.target.value)
                      }
                      placeholder="WhatsApp / Contato do sócio"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      value={partner.notes || ""}
                      onChange={(e) =>
                        handlePartnerChange(partner.id, "notes", e.target.value)
                      }
                      placeholder="Obs / Papel (ex: 50% capital, 0% trampo)"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Regras ou Observações da Sociedade (Opcional)
              </label>
              <textarea
                rows={2}
                value={societyNotes}
                onChange={(e) => setSocietyNotes(e.target.value)}
                placeholder="Ex: Lucro dividido mensalmente após quitação de custos de transporte e manutenção..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Criar Página & Abrir Painel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
